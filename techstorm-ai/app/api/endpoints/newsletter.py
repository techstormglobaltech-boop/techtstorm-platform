from fastapi import APIRouter, HTTPException
import feedparser
from bs4 import BeautifulSoup
import os
from huggingface_hub import InferenceClient

router = APIRouter()

hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(token=hf_token)

RSS_FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://github.blog/feed/"
]

def fetch_top_news():
    articles = []
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                summary = BeautifulSoup(entry.summary, "html.parser").get_text() if hasattr(entry, 'summary') else ""
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": summary[:300] + "..."
                })
        except Exception as e:
            print(f"Failed to fetch from {url}: {e}")
    return articles

@router.post("/generate")
async def generate_newsletter():
    try:
        articles = fetch_top_news()
        
        prompt = "You are the Editor for TechStorm Global, a tech mentorship academy. Review these recent tech articles:\n\n"
        for i, a in enumerate(articles):
            prompt += f"{i+1}. {a['title']}\nSummary: {a['summary']}\n\n"
            
        prompt += """
Select the 3-5 most important ones for software engineering and AI students.
Write an engaging, inspiring weekly newsletter in Markdown format.
Structure:
- **Catchy Title** (Must be a single H1 like # TechStorm Weekly: [Catchy Topic])
- **Introduction** (A brief welcome)
- **Top Stories** (Use bullet points or H3s, include a brief summary for each)
- **Why this matters for your career** (Actionable advice for tech students based on the news)

Output only the Markdown content without any surrounding markdown code block syntax.
"""
        
        models_to_try = [
            "meta-llama/Llama-3.3-70B-Instruct",
            "Qwen/Qwen2.5-72B-Instruct",
            "mistralai/Mixtral-8x7B-Instruct-v0.1",
        ]
        
        content = ""
        for model_name in models_to_try:
            try:
                print(f"Attempting newsletter generation with model: {model_name}")
                messages = [{"role": "user", "content": prompt}]
                response = client.chat_completion(
                    messages,
                    model=model_name,
                    max_tokens=2000,
                    temperature=0.7,
                )
                content = response.choices[0].message.content.strip()
                break
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                continue
                
        if not content:
            raise Exception("All models failed to generate newsletter")
        
        # Extract title if it's the first line
        lines = content.strip().split('\n')
        title = "TechStorm Weekly Digest"
        if lines[0].startswith('# '):
            title = lines[0].replace('# ', '').strip()
            content = '\n'.join(lines[1:]).strip()
            
        return {"title": title, "content": content}

    except Exception as e:
        print(f"Error generating newsletter: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate newsletter")
