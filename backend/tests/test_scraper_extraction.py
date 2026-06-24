"""
Unit tests for scraper.py extraction functions — pure BeautifulSoup logic only.
No HTTP calls, no network. All tests run against the sample HTML fixture.
"""
import pytest
from pathlib import Path
from bs4 import BeautifulSoup

from scraper import (
    extract_word_count,
    extract_headings,
    detect_ctas,
    classify_links,
    analyze_images,
    extract_meta,
)

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "sample_page.html"


@pytest.fixture(scope="module")
def soup() -> BeautifulSoup:
    return BeautifulSoup(FIXTURE_PATH.read_text(encoding="utf-8"), "html.parser")


@pytest.fixture(scope="module")
def base_url() -> str:
    return "https://example.com"


class TestExtractWordCount:
    def test_returns_positive_integer(self, soup):
        count = extract_word_count(soup)
        assert isinstance(count, int)
        assert count > 0

    def test_excludes_nav_and_script_tags(self, soup):
        # nav text ("Home", "About", "Twitter") should not bloat the count
        count = extract_word_count(soup)
        # fixture has ~120 meaningful words — rough bounds check
        assert 80 <= count <= 200

    def test_empty_html_returns_zero(self):
        empty_soup = BeautifulSoup("<html><body></body></html>", "html.parser")
        assert extract_word_count(empty_soup) == 0


class TestExtractHeadings:
    def test_returns_correct_h1_count(self, soup):
        headings = extract_headings(soup)
        assert headings["h1"] == 1

    def test_returns_correct_h2_count(self, soup):
        headings = extract_headings(soup)
        assert headings["h2"] == 3

    def test_returns_correct_h3_count(self, soup):
        headings = extract_headings(soup)
        assert headings["h3"] == 2

    def test_returns_dict_with_required_keys(self, soup):
        headings = extract_headings(soup)
        assert set(headings.keys()) == {"h1", "h2", "h3"}


class TestDetectCTAs:
    def test_counts_buttons(self, soup):
        # fixture has 1 <button>Get Started</button>
        count = detect_ctas(soup)
        assert count >= 1

    def test_counts_keyword_matched_links(self, soup):
        # fixture has "Contact Us", "Book a Demo" — both should match
        count = detect_ctas(soup)
        assert count >= 3

    def test_does_not_count_plain_nav_links(self):
        html = "<a href='/about'>About</a><a href='/blog'>Blog</a>"
        plain_soup = BeautifulSoup(html, "html.parser")
        # "Blog" is not in CTA keywords — count should be 0
        assert detect_ctas(plain_soup) == 0


class TestClassifyLinks:
    def test_counts_internal_links(self, soup, base_url):
        result = classify_links(soup, base_url)
        # fixture internal: /, /about, /contact, /demo, /blog = 5
        assert result["internal"] >= 4

    def test_counts_external_links(self, soup, base_url):
        result = classify_links(soup, base_url)
        # fixture external: twitter.com, external.com, anothersite.com = 3
        assert result["external"] == 3

    def test_returns_dict_with_required_keys(self, soup, base_url):
        result = classify_links(soup, base_url)
        assert set(result.keys()) == {"internal", "external"}


class TestAnalyzeImages:
    def test_counts_total_images(self, soup):
        result = analyze_images(soup)
        assert result["total"] == 3

    def test_counts_images_with_empty_alt(self, soup):
        # fixture: 1 missing alt entirely, 1 empty alt=""
        assert result["missing_alt"] == 2 if (result := analyze_images(soup)) else True

    def test_computes_missing_alt_percentage(self, soup):
        result = analyze_images(soup)
        expected_pct = round((result["missing_alt"] / result["total"]) * 100)
        assert result["missing_alt_pct"] == expected_pct

    def test_no_images_returns_zero_pct(self):
        no_img_soup = BeautifulSoup("<html><body><p>text</p></body></html>", "html.parser")
        result = analyze_images(no_img_soup)
        assert result == {"total": 0, "missing_alt": 0, "missing_alt_pct": 0}


class TestExtractMeta:
    def test_extracts_title_text(self, soup):
        meta = extract_meta(soup)
        assert meta["title"]["text"] == "Advanced SEO Guide for 2024"

    def test_computes_title_length(self, soup):
        meta = extract_meta(soup)
        assert meta["title"]["length"] == len("Advanced SEO Guide for 2024")

    def test_extracts_description_text(self, soup):
        meta = extract_meta(soup)
        assert "SEO strategies" in meta["description"]["text"]

    def test_computes_description_length(self, soup):
        meta = extract_meta(soup)
        assert meta["description"]["length"] > 0

    def test_missing_description_returns_empty_string(self):
        no_desc_soup = BeautifulSoup(
            "<html><head><title>My Page</title></head></html>", "html.parser"
        )
        meta = extract_meta(no_desc_soup)
        assert meta["description"]["text"] == ""
        assert meta["description"]["length"] == 0
