"""
Unit tests for readability.py — pure functions only, no I/O, no AI calls.
Tests the Flesch Reading Ease formula and label mapping.
"""
import pytest
from readability import compute_flesch_score, get_readability_label, count_syllables


class TestCountSyllables:
    def test_single_vowel_word(self):
        assert count_syllables("the") == 1

    def test_multi_syllable_word(self):
        assert count_syllables("optimisation") >= 5

    def test_single_letter(self):
        assert count_syllables("a") == 1

    def test_empty_string_returns_zero(self):
        assert count_syllables("") == 0

    def test_word_with_silent_e(self):
        # "page" → 1 syllable
        assert count_syllables("page") == 1

    def test_compound_word(self):
        # "backlinks" → 2 syllables
        assert count_syllables("backlinks") >= 2


class TestComputeFleschScore:
    def test_score_is_within_valid_range(self):
        text = (
            "Search engine optimisation is the practice of increasing traffic. "
            "It involves technical and creative elements to improve rankings. "
            "Most web traffic is driven by search engines and algorithms."
        )
        score = compute_flesch_score(text)
        assert 0 <= score <= 100

    def test_simple_text_scores_higher_than_complex(self):
        simple = "The cat sat on the mat. The dog ran. It was fun."
        complex_text = (
            "The implementation of multifaceted algorithmic optimisation strategies "
            "necessitates comprehensive understanding of computational methodologies. "
            "Sophisticated parameterisation of hierarchical taxonomies facilitates "
            "extraordinary improvements in systemic performance characteristics."
        )
        assert compute_flesch_score(simple) > compute_flesch_score(complex_text)

    def test_single_sentence_does_not_raise(self):
        score = compute_flesch_score("This is a single sentence.")
        assert isinstance(score, float)

    def test_empty_text_returns_zero(self):
        assert compute_flesch_score("") == 0.0


class TestGetReadabilityLabel:
    def test_very_easy(self):
        assert get_readability_label(95) == "Very Easy"

    def test_easy(self):
        assert get_readability_label(85) == "Easy"

    def test_fairly_easy(self):
        assert get_readability_label(75) == "Fairly Easy"

    def test_standard(self):
        assert get_readability_label(65) == "Standard"

    def test_fairly_difficult(self):
        assert get_readability_label(55) == "Fairly Difficult"

    def test_difficult(self):
        assert get_readability_label(40) == "Difficult"

    def test_very_difficult(self):
        assert get_readability_label(20) == "Very Difficult"

    def test_boundary_90_is_very_easy(self):
        assert get_readability_label(90) == "Very Easy"

    def test_boundary_30_is_difficult(self):
        assert get_readability_label(30) == "Difficult"
