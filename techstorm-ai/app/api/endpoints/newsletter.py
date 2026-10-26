from fastapi import APIRouter, HTTPException
from app.api.llm import generate_text

router = APIRouter()

RSS_FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://github.blog/feed/",
]


def fetch_top_news():
    articles = []
    try:
        import feedparser
        from bs4 import BeautifulSoup
    except ImportError as e:
        print(f"Optional RSS parser dependency missing: {e}")
        return articles

    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                summary = (
                    BeautifulSoup(entry.summary, "html.parser").get_text()
                    if hasattr(entry, "summary")
                    else ""
                )
                articles.append(
                    {
                        "title": entry.title,
                        "link": entry.link,
                        "summary": summary[:300] + "...",
                    }
                )
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

        content = generate_text(prompt=prompt, max_tokens=2000, temperature=0.7)

        lines = content.strip().split("\n")
        title = "TechStorm Weekly Digest"
        if lines[0].startswith("# "):
            title = lines[0].replace("# ", "").strip()
            content = "\n".join(lines[1:]).strip()

        return {"title": title, "content": content}

    except Exception as e:
        print(f"Error generating newsletter: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate newsletter: {str(e)}")
