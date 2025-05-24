"""
wsgi.py

Konfiguracja WSGI dla aplikacji Django.
Punkt wejścia dla serwera WSGI, umożliwia uruchomienie aplikacji przez serwer (np. Gunicorn).
"""

import os  # do ustawiania zmiennych środowiskowych
from django.core.wsgi import get_wsgi_application  # funkcja zwracająca aplikację WSGI

# Ustawienie domyślnego modułu ustawień Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Inicjalizacja aplikacji Django w trybie WSGI
application = get_wsgi_application()  # obiekt WSGI, używany przez serwer do obsługi żądań HTTP
