class ScrapeError(Exception):
    def __init__(self, code: str, reason: str) -> None:
        super().__init__(reason)
        self.code = code
        self.reason = reason


class InvalidURLError(ScrapeError):
    def __init__(self, reason: str = "Malformed or non-HTTP URL") -> None:
        super().__init__(code="INVALID_URL", reason=reason)


class URLUnreachableError(ScrapeError):
    def __init__(self, reason: str = "Request timed out after retry") -> None:
        super().__init__(code="URL_UNREACHABLE", reason=reason)


class BotBlockedError(ScrapeError):
    def __init__(self, reason: str = "Site returned 403 — bot protection detected") -> None:
        super().__init__(code="BOT_BLOCKED", reason=reason)


class AuthWallError(ScrapeError):
    def __init__(self, reason: str = "Page requires authentication — log in to access this URL") -> None:
        super().__init__(code="AUTH_REQUIRED", reason=reason)


class PageNotFoundError(ScrapeError):
    def __init__(self, reason: str = "Page returned 404 — not found") -> None:
        super().__init__(code="PAGE_NOT_FOUND", reason=reason)


class AIAnalysisError(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


class ProviderRateLimitError(AIAnalysisError):
    def __init__(self, reason: str = "AI provider rate limit exceeded") -> None:
        super().__init__(reason=reason)


class ProviderTimeoutError(AIAnalysisError):
    def __init__(self, reason: str = "AI provider request timed out") -> None:
        super().__init__(reason=reason)
