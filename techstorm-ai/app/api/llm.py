import os
import json
import re
import time
from openai import OpenAI
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()


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
        # Fallback: locate the outermost JSON object braces
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def generate_text(
    prompt: str,
    max_tokens: int = 2048,
    temperature: float = 0.3,
    json_mode: bool = False,
) -> str:
    """
    Multi-provider LLM cascade:
    1. Groq (GROQ_API_KEY) -> llama-3.3-70b-versatile, llama-3.1-8b-instant
    2. Google Gemini (GOOGLE_API_KEY / GEMINI_API_KEY) -> gemini-2.5-flash, gemini-2.0-flash
    3. OpenAI (OPENAI_API_KEY) -> gpt-4o-mini
    4. Hugging Face Inference Router (HF_TOKEN / HUGGINGFACE_API_KEY) -> Llama-3.3-70B, Qwen2.5-72B, Llama-3.1-8B
    """
    errors = []
    messages = [{"role": "user", "content": prompt}]

    # 1. GROQ (Primary - Fast & generous free tier)
    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if groq_key:
        groq_client = OpenAI(
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1",
        )
        groq_models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
        ]
        for model_name in groq_models:
            try:
                print(f"[LLM] Attempting Groq model: {model_name}")
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                resp = groq_client.chat.completions.create(**kwargs)
                content = resp.choices[0].message.content
                if content:
                    print(f"[LLM] Success with Groq ({model_name})")
                    return content.strip()
            except Exception as e:
                err_str = str(e)
                print(f"[LLM] Groq ({model_name}) failed: {err_str}")
                errors.append(f"Groq({model_name}): {err_str[:160]}")
                if "429" in err_str:
                    time.sleep(2)

    # 2. GOOGLE GEMINI
    gemini_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
    if gemini_key:
        gemini_client = OpenAI(
            api_key=gemini_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        gemini_models = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
        ]
        for model_name in gemini_models:
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
        try:
            print("[LLM] Attempting OpenAI model: gpt-4o-mini")
            resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            content = resp.choices[0].message.content
            if content:
                print("[LLM] Success with OpenAI (gpt-4o-mini)")
                return content.strip()
        except Exception as e:
            err_str = str(e)
            print(f"[LLM] OpenAI failed: {err_str}")
            errors.append(f"OpenAI: {err_str[:160]}")

    # 4. HUGGING FACE INFERENCE ROUTER
    hf_token = (os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY") or "").strip()
    if hf_token:
        hf_client = InferenceClient(token=hf_token)
        hf_models = [
            "meta-llama/Llama-3.3-70B-Instruct",
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.1-8B-Instruct",
        ]
        for model_name in hf_models:
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
                # 402 Payment Required or 401 Unauthorized is account-wide on HF; fail fast
                if "402" in err_str or "401" in err_str:
                    break
                if "429" in err_str:
                    time.sleep(2)

    error_summary = " | ".join(errors) if errors else "No AI API keys configured (set GROQ_API_KEY, GOOGLE_API_KEY, or HF_TOKEN)"
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
