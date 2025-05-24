"""
core/utils.py

Zawiera funkcje pomocnicze do komunikacji z API Spoonacular:
- fetch_from_spoonacular: wykonuje zapytania HTTP GET, obsługuje błędy i limity
- _log: zapisuje logi wywołań HTTP do loggera 'spoonacular' w formacie CSV-like
"""
import logging  # logowanie informacji o żądaniach
import os  # dostęp do zmiennych środowiskowych
import requests  # wykonanie żądań HTTP
from datetime import datetime  # formatowanie znacznika czasu

# Klucz API pobierany z pliku .env (SPOONACULAR_KEY)
SPOON_KEY = os.getenv("SPOONACULAR_KEY")
BASE_URL = "https://api.spoonacular.com"  # podstawowy URL API

# Logger nazwy 'spoonacular' konfigurowany w core/views.py
logger = logging.getLogger("spoonacular")


def _log(method: str, url: str, status: int, extra="") -> None:
    """
    Zapisuje pojedynczy wpis do API logu (api.log):
    format: ISO_time ; METHOD ; url ; status ; dodatkowe informacje
    """
    logger.info(
        "%s ; %s ; %s ; %s ; %s",
        datetime.utcnow().isoformat(timespec="seconds"),
        method,
        url,
        status,
        extra,
    )


def fetch_from_spoonacular(endpoint: str, params: dict | None = None):
    """
    Wykonuje żądanie GET do Spoonacular:
    - Dodaje klucz apiKey do parametrów
    - Obsługuje wyjątki sieciowe i statusy HTTP
    - Zwraca JSON (dict/list) lub {'error': ...}
    """
    params = params or {}
    params["apiKey"] = SPOON_KEY
    url = f"{BASE_URL}{endpoint}"

    try:
        r = requests.get(url, params=params, timeout=10)
    except requests.RequestException as exc:
        _log("GET", url, 0, f"request-error {exc}")
        return {"error": "request"}

    # Zapis logu w każdym przypadku
    _log("GET", r.url, r.status_code, r.text[:200].replace("\n", " "))

    # Obsługa limitów i błędów
    if r.status_code in (402, 429):
        return {"error": "quota"}
    if r.status_code >= 400:
        return {"error": f"status {r.status_code}"}

    return r.json()
