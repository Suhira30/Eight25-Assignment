import os
import re
import time
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from exceptions import AuthWallError, BotBlockedError, InvalidURLError, PageNotFoundError, URLUnreachableError
from logger import get_logger
from models import HeadingCounts, ImageStats, LinkCounts, MetaField, ScrapedData

logger = get_logger(__name__)

CTA_KEYWORDS = [
    "get started", "contact us", "learn more", "sign up", "book",
    "schedule", "request", "download", "try", "buy", "subscribe",
    "get", "start", "register", "demo", "free", "explore",
]

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
CONNECT_TIMEOUT = 5   # seconds to establish TCP connection
READ_TIMEOUT = 8      # seconds to receive response after connection
VISIBLE_TEXT_MAX_CHARS = 3000

# Attributes used by lazy-loading libraries to defer the real src
_LAZY_SRC_ATTRS = ("data-src", "data-lazy-src", "data-original", "data-lazy", "data-url")
# Inline placeholder patterns that are not real image URLs
_PLACEHOLDER_PREFIXES = ("data:image/",)

_USE_PLAYWRIGHT = os.getenv("USE_PLAYWRIGHT", "false").lower() == "true"

# Title patterns that indicate the page is a login/auth gate
_LOGIN_TITLE_PATTERNS = (
    "log in", "sign in", "login", "signin", "create account",
    "join linkedin", "join to see", "access denied", "please log in",
)
# Path segments that indicate a redirect to an auth page
_LOGIN_PATH_SEGMENTS = ("/login", "/signin", "/sign-in", "/auth", "/sso", "/session")


def _detect_login_wall(soup: BeautifulSoup, original_url: str, final_url: str) -> None:
    """Raise AuthWallError if the page is a login gate rather than the requested content."""
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True).lower() if title_tag else ""
    if any(pattern in title for pattern in _LOGIN_TITLE_PATTERNS):
        raise AuthWallError(
            f"Page requires authentication — redirected to a login screen. "
            f"URL: {final_url}"
        )
    # Detect redirect to a different path containing login/auth keywords
    original_path = urlparse(original_url).path.rstrip("/").lower()
    final_path = urlparse(final_url).path.rstrip("/").lower()
    if final_path != original_path and any(seg in final_path for seg in _LOGIN_PATH_SEGMENTS):
        raise AuthWallError(
            f"Redirected from {original_url} to login page: {final_url}"
        )


def _effective_src(img) -> str:
    """Return the real image URL, checking lazy-load fallback attributes when src
    is absent or a data-URI placeholder (the pattern used by Intersection Observer
    lazy loaders)."""
    src = img.get("src", "").strip()
    if src and src != "#" and not any(src.startswith(p) for p in _PLACEHOLDER_PREFIXES):
        return src
    for attr in _LAZY_SRC_ATTRS:
        val = img.get(attr, "").strip()
        if val:
            return val
    return ""


def extract_word_count(soup: BeautifulSoup) -> int:
    working = BeautifulSoup(str(soup), "html.parser")
    for tag in working.find_all(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = working.get_text(separator=" ")
    return len(text.split())


def extract_headings(soup: BeautifulSoup) -> dict:
    return {
        "h1": len(soup.find_all("h1")),
        "h2": len(soup.find_all("h2")),
        "h3": len(soup.find_all("h3")),
    }


def _link_is_cta(text: str) -> bool:
    text_lower = text.lower()
    for kw in CTA_KEYWORDS:
        if " " in kw:
            if kw in text_lower:
                return True
        else:
            if re.search(r"\b" + re.escape(kw) + r"\b", text_lower):
                return True
    return False


def detect_ctas(soup: BeautifulSoup) -> int:
    count = len(soup.find_all("button"))
    count += len(soup.find_all("input", type=lambda t: t and t.lower() in ("submit", "button")))
    for a in soup.find_all("a"):
        if _link_is_cta(a.get_text(strip=True)):
            count += 1
    return count


def classify_links(soup: BeautifulSoup, base_url: str) -> dict:
    base_domain = urlparse(base_url).netloc
    internal = 0
    external = 0

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        if href.startswith("/"):
            internal += 1
        elif href.startswith(("http://", "https://")):
            link_domain = urlparse(href).netloc
            if link_domain == base_domain:
                internal += 1
            else:
                external += 1

    return {"internal": internal, "external": external}


def analyze_images(soup: BeautifulSoup) -> dict:
    imgs = soup.find_all("img")
    total = len(imgs)
    # Treat whitespace-only alt as missing (same accessibility failure as no alt)
    missing_alt = sum(1 for img in imgs if not img.get("alt", "").strip())
    missing_alt_pct = round((missing_alt / total) * 100) if total else 0
    return {"total": total, "missing_alt": missing_alt, "missing_alt_pct": missing_alt_pct}


def extract_meta(soup: BeautifulSoup) -> dict:
    title_tag = soup.find("title")
    title_text = title_tag.get_text(strip=True) if title_tag else ""

    desc_tag = soup.find("meta", attrs={"name": "description"})
    desc_text = desc_tag.get("content", "").strip() if desc_tag else ""

    return {
        "title": {"text": title_text, "length": len(title_text)},
        "description": {"text": desc_text, "length": len(desc_text)},
    }


def _fetch_html_requests(url: str) -> tuple[str, str]:
    """Fetch raw HTML using requests. Returns (html, final_url).
    Fast; works for server-rendered pages. Misses images injected by client-side JS."""
    response = None
    for attempt in range(2):
        try:
            response = requests.get(
                url,
                headers=REQUEST_HEADERS,
                timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
            )
            break
        except requests.Timeout:
            if attempt == 0:
                logger.info("Timeout on first attempt, retrying %s", url)
                continue
            logger.error("Timeout after retry for %s", url)
            raise URLUnreachableError(f"Request timed out after {CONNECT_TIMEOUT}s connect / {READ_TIMEOUT}s read: {url}")
        except requests.ConnectionError as exc:
            logger.error("Connection error for %s: %s", url, exc)
            raise URLUnreachableError(f"Could not connect to {url}")

    if response.status_code == 404:
        raise PageNotFoundError(f"Page returned 404: {url}")

    if response.status_code in (401, 403, 407):
        raise BotBlockedError(f"Site returned {response.status_code} — access denied")

    if response.status_code == 429:
        raise BotBlockedError(f"Site returned 429 — rate limited, try again later")

    if not response.ok:
        # Catches 5xx, LinkedIn's 999, Cloudflare 520–527, etc.
        raise URLUnreachableError(f"Site returned unexpected status {response.status_code}: {url}")

    return response.text, response.url


def _fetch_html_playwright(url: str) -> tuple[str, str]:
    """Fetch fully-rendered HTML using a headless Chromium browser. Returns (html, final_url).

    Handles:
    - JS-rendered DOM (React / Vue / Angular SPA pages)
    - Lazy-loaded images (Intersection Observer + data-src pattern)
    - Async-resolved URLs populated after the window load event
    - Premature capture: waits for window load before capturing HTML

    Does NOT handle infinite-scroll content below the first viewport — that
    requires repeated scroll simulation and is documented as a known limitation.

    Requires: pip install playwright && playwright install chromium
    """
    try:
        from playwright.sync_api import TimeoutError as PWTimeoutError
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise URLUnreachableError(
            "USE_PLAYWRIGHT=true requires Playwright: "
            "pip install playwright && playwright install chromium"
        )

    logger.info("Launching headless Chromium for %s", url)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=REQUEST_HEADERS["User-Agent"])
            # "load" fires on the window load event (~2–5s on most pages).
            # "networkidle" waits until zero in-flight requests for 500ms — this
            # never completes on live-feed SPAs (LinkedIn, Twitter) and causes
            # the full 30s timeout to expire. "load" is the right trade-off here.
            page.goto(url, wait_until="load", timeout=15_000)
            final_url = page.url
            # One full-page scroll triggers Intersection Observer lazy loaders
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(500)
            html = page.content()
            browser.close()
        return html, final_url
    except PWTimeoutError:
        raise URLUnreachableError(f"Page did not finish loading within 15s: {url}")


def scrape(url: str) -> ScrapedData:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        logger.error("Invalid URL scheme for %s", url)
        raise InvalidURLError(f"URL must start with http:// or https://: {url}")

    logger.info("Fetching %s (playwright=%s)", url, _USE_PLAYWRIGHT)
    start = time.time()

    html, final_url = _fetch_html_playwright(url) if _USE_PLAYWRIGHT else _fetch_html_requests(url)
    soup = BeautifulSoup(html, "html.parser")
    _detect_login_wall(soup, url, final_url)

    headings_dict = extract_headings(soup)
    links_dict = classify_links(soup, url)
    images_dict = analyze_images(soup)
    meta_dict = extract_meta(soup)

    body = soup.find("body")
    raw_visible = body.get_text(separator=" ") if body else soup.get_text(separator=" ")
    visible_text = " ".join(raw_visible.split())[:VISIBLE_TEXT_MAX_CHARS]

    elapsed = time.time() - start
    logger.info("Scraped %s in %.2fs", url, elapsed)

    return ScrapedData(
        url=url,
        word_count=extract_word_count(soup),
        headings=HeadingCounts(**headings_dict),
        ctas=detect_ctas(soup),
        links=LinkCounts(**links_dict),
        images=ImageStats(**images_dict),
        meta_title=MetaField(**meta_dict["title"]) if meta_dict["title"]["text"] else None,
        meta_description=MetaField(**meta_dict["description"]) if meta_dict["description"]["text"] else None,
        visible_text=visible_text,
    )
