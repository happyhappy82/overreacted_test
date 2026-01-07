import json
import urllib.request
import re
from html.parser import HTMLParser

class NotionContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.content = []
        self.current_tag = None

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag

    def handle_data(self, data):
        if data.strip():
            self.content.append(data.strip())

def fetch_notion_page(url):
    """
    Fetch Notion page content using API endpoint
    """
    # Extract page ID from URL
    page_id_match = re.search(r'([a-f0-9]{32}|[a-f0-9-]{36})(?:\?|$)', url)
    if not page_id_match:
        print("Could not extract page ID from URL")
        return None

    page_id = page_id_match.group(1).replace('-', '')

    # Try to fetch from Notion's public API
    api_url = f"https://www.notion.so/api/v3/getPublicPageData"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
    }

    payload = json.dumps({
        "pageId": page_id,
        "type": "block-space"
    }).encode('utf-8')

    try:
        request = urllib.request.Request(api_url, data=payload, headers=headers, method='POST')
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except Exception as e:
        print(f"Error fetching page: {e}")
        return None

if __name__ == "__main__":
    url = "https://warm-hip-fe9.notion.site/LM-PC-2e0753ebc013807e8c78e7f403e83a90"
    data = fetch_notion_page(url)

    if data:
        with open('notion_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Data saved to notion_data.json")
    else:
        print("Failed to fetch Notion page")
