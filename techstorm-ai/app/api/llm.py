import os
import json
import time
from typing import List
from openai import OpenAI
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

_DISCOVERED_GROQ_MODELS: List[str] = []


def extract_json(content: str) -> dict:
    """Safely extract and parse a JSON object from LLM text output."""
    text = content.strip()
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def _detect_provider_config(raw_key: str):
    """Detect the right OpenAI-compatible base_url based on key prefix."""
    key = raw_key.strip()
    if key.startswith("xai-"):
        return "https://api.x.ai/v1", ["grok-3-mini", "grok-3", "grok-2-latest"]
    if key.startswith("AIza"):
        return "https://generativelanguage.googleapis.com/v1beta/openai/", ["gemini-2.5-flash", "gemini-2.0-flash"]
    if key.startswith("sk-or-"):
        return "https://openrouter.ai/api/v1", ["meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-exp:free"]
    if key.startswith("sk-") and not key.startswith("gsk_"):
        return "https://api.openai.com/v1", ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4o"]
    return "https://api.groq.com/openai/v1", [
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "meta-llama/llama-4-maverick-17b-128e-instruct",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3-32b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
    ]


def get_available_models_for_client(client: OpenAI, fallback_candidates: List[str]) -> List[str]:
    """Query /models endpoint to discover exact chat models enabled for this API key."""
    global _DISCOVERED_GROQ_MODELS
    if _DISCOVERED_GROQ_MODELS:
        return _DISCOVERED_GROQ_MODELS

    try:
        models_resp = client.models.list()
        all_ids = [m.id for m in models_resp.data]
        print(f"[LLM] Discovered models on account: {all_ids}")

        # Filter out non-chat models (whisper, tts, guard, embedding, moderation)
        skip_keywords = ("whisper", "tts", "guard", "embed", "moderation", "orpheus", "playai", "distil-whisper", "allam")
        chat_ids = [
            mid for mid in all_ids
            if not any(kw in mid.lower() for kw in skip_keywords)
        ]

        # Prioritize our preferred candidates if they exist in chat_ids, then append the rest
        ordered = [m for m in fallback_candidates if m in chat_ids]
        for mid in chat_ids:
            if mid not in ordered:
                ordered.append(mid)

        if ordered:
            _DISCOVERED_GROQ_MODELS = ordered
            return ordered
    except Exception as e:
        print(f"[LLM] Could not list models dynamically: {e}")

    return fallback_candidates


def generate_text(
    prompt: str,
    max_tokens: int = 2048,
    temperature: float = 0.3,
    json_mode: bool = False,
) -> str:
    errors = []
    messages = [{"role": "user", "content": prompt}]
    if json_mode and "json" not in prompt.lower():
        messages[0]["content"] = prompt + "\n\nRespond strictly with a valid JSON object."

    # 1. GROQ / PRIMARY KEY
    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if groq_key:
        base_url, default_candidates = _detect_provider_config(groq_key)
        groq_client = OpenAI(api_key=groq_key, base_url=base_url)
        models_to_try = get_available_models_for_client(groq_client, default_candidates)

        for model_name in models_to_try:
            try:
                print(f"[LLM] Attempting primary model: {model_name} via {base_url}")
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                try:
                    resp = groq_client.chat.completions.create(**kwargs)
                except Exception as inner_e:
                    # Some models don't support response_format={"type": "json_object"}; retry without it
                    if json_mode and ("response_format" in str(inner_e) or "json_validate_failed" in str(inner_e) or "400" in str(inner_e)):
                        kwargs.pop("response_format", None)
                        resp = groq_client.chat.completions.create(**kwargs)
                    else:
                        raise inner_e

                content = resp.choices[0].message.content
                if content:
                    # Strip <think>...</think> reasoning tags if a reasoning model (like qwen3/deepseek) was used
                    if "<think>" in content and "</think>" in content:
                        content = content.split("</think>", 1)[1].strip()
                    print(f"[LLM] Success with {model_name}")
                    return content.strip()
            except Exception as e:
                err_str = str(e)
                print(f"[LLM] Primary ({model_name}) failed: {err_str}")
                errors.append(f"Primary({model_name}): {err_str[:160]}")
                if "429" in err_str:
                    time.sleep(2)

    # 2. GOOGLE GEMINI
    gemini_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
    if gemini_key:
        gemini_client = OpenAI(
            api_key=gemini_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash"]:
            try:
                print(f"[LLM] Attempting Gemini model: {model_name}")
                resp = gemini_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                content = resp.choices[0].message.content
                if content:
                    print(f"[LLM] Success with Gemini ({model_name})")
                    return content.strip()
            except Exception as e:
                err_str = str(e)
                print(f"[LLM] Gemini ({model_name}) failed: {err_str}")
                errors.append(f"Gemini({model_name}): {err_str[:160]}")

    # 3. OPENAI
    openai_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if openai_key:
        openai_client = OpenAI(api_key=openai_key)
        for model_name in ["gpt-4o-mini", "gpt-4.1-mini"]:
            try:
                print(f"[LLM] Attempting OpenAI model: {model_name}")
                resp = openai_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                content = resp.choices[0].message.content
                if content:
                    print(f"[LLM] Success with OpenAI ({model_name})")
                    return content.strip()
            except Exception as e:
                err_str = str(e)
                print(f"[LLM] OpenAI ({model_name}) failed: {err_str}")
                errors.append(f"OpenAI({model_name}): {err_str[:160]}")

    # 4. HUGGING FACE INFERENCE ROUTER
    hf_token = (os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY") or "").strip()
    if hf_token:
        hf_client = InferenceClient(token=hf_token)
        for model_name in [
            "meta-llama/Llama-3.3-70B-Instruct",
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.1-8B-Instruct",
        ]:
            try:
                print(f"[LLM] Attempting Hugging Face model: {model_name}")
                resp = hf_client.chat_completion(
                    messages,
                    model=model_name,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                content = resp.choices[0].message.content
                if content:
                    print(f"[LLM] Success with Hugging Face ({model_name})")
                    return content.strip()
            except Exception as e:
                err_str = str(e)
                print(f"[LLM] Hugging Face ({model_name}) failed: {err_str}")
                errors.append(f"HF({model_name}): {err_str[:160]}")
                if "402" in err_str or "401" in err_str:
                    break
                if "429" in err_str:
                    time.sleep(2)

    error_summary = " | ".join(errors) if errors else "No AI API keys configured"
    raise RuntimeError(f"All AI providers failed: {error_summary}")


def generate_json(
    prompt: str,
    max_tokens: int = 2048,
    temperature: float = 0.3,
) -> dict:
    content = generate_text(
        prompt=prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        json_mode=True,
    )
    return extract_json(content)
