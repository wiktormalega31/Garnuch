# -*- coding: utf-8 -*-
"""
config/settings.py

Główny plik konfiguracyjny Django dla aplikacji backend.
Wczytuje zmienne środowiskowe, definiuje ścieżki, sekcje bezpieczeństwa,
a także listę aplikacji i middleware.
"""
import os  # moduł do obsługi zmiennych środowiskowych i operacji na ścieżkach
from pathlib import Path  # moduł do pracy z ścieżkami w sposób obiektowy
from dotenv import load_dotenv  # funkcja do wczytywania pliku .env

# --- Wczytanie zmiennych środowiskowych z pliku .env ---
load_dotenv()

# --- Ścieżka bazowa projektu (katalog backend/) ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Ustawienia bezpieczeństwa ---
# Sekretny klucz do hashów i zabezpieczeń, musi być unikalny w środowisku produkcyjnym
SECRET_KEY = os.getenv("SECRET_KEY")
# Flaga debugowania: włączony tryb developerski jeśli DEBUG=True w .env
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
# Dozwolone hosty: lista domen lub IP rozdzielonych przecinkami
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# --- Aplikacje zainstalowane w projekcie ---
INSTALLED_APPS = [
    # wbudowane aplikacje Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # REST framework i obsługa tokenów
    "rest_framework",
    "corsheaders",  # CORS dla API

    # Autoryzacja społecznościowa (allauth)
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.github",
    "dj_rest_auth",
    "dj_rest_auth.registration",

    # Aplikacje własne
    "users",  # zarządzanie użytkownikami i model CustomUser
    "core",   # główna logika aplikacji
    "payments",  # moduł płatności
    "rest_framework.authtoken",  # tokeny REST
]

# --- Middleware (kolejność ważna) ---
MIDDLEWARE = [
    # bezpieczeństwo podstawowe
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # middleware własne: dodaje cookie premiumstatus
    "core.middleware.PremiumStatusCookieMiddleware",

    # CORS przed common
    "corsheaders.middleware.CorsMiddleware",

    # podstawowe middleware Django
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",  # synchronizacja z allauth
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --- Konfiguracja plików URL i aplikacji WSGI ---
ROOT_URLCONF = "config.urls"  # główny plik URL
WSGI_APPLICATION = "config.wsgi.application"  # punkt wejścia WSGI

# --- Szablony ---
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --- Baza danych (PostgreSQL) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME":     os.getenv("DB_NAME"),
        "USER":     os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST":     os.getenv("DB_HOST", "localhost"),
        "PORT":     os.getenv("DB_PORT", "5432"),
    }
}

# --- Użytkownik niestandardowy ---
AUTH_USER_MODEL = "users.CustomUser"

# --- Django REST framework → tylko sesja ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# --- Allauth / dj-rest-auth ---
SITE_ID = 1

# Rejestracja i logowanie
ACCOUNT_EMAIL_REQUIRED      = True
ACCOUNT_EMAIL_VERIFICATION  = "mandatory"
SOCIALACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_SIGNUP_FIELDS = ["username*", "email*", "password1*", "password2*"]

LOGIN_REDIRECT_URL          = "http://localhost:5173/"
LOGOUT_REDIRECT_URL         = "http://localhost:5173/login"
ACCOUNT_LOGOUT_REDIRECT_URL = "http://localhost:5173/login"

# Scalony adapter (przekierowanie + wymuszanie e-mail verify dla GitHub)
SOCIALACCOUNT_ADAPTER = "core.adapters.GarnuchSocialAdapter"

# Serializery rejestracji (pozostawiamy domyślny dj-rest-auth)
REST_AUTH_REGISTER_SERIALIZERS = {
    "REGISTER_SERIALIZER": "dj_rest_auth.registration.serializers.RegisterSerializer",
}

# Provider GitHub
SOCIALACCOUNT_PROVIDERS = {
    "github": {
        "SCOPE": ["user:email"],
        "APP": {
            "client_id": os.getenv("GITHUB_CLIENT_ID"),
            "secret":    os.getenv("GITHUB_CLIENT_SECRET"),
            "key": "",
        },
    }
}

# --- PayPal (opcjonalnie) ---
PAYPAL_CLIENT_ID     = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE          = os.getenv("PAYPAL_MODE", "sandbox")

# --- CORS & CSRF ---
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS  = [
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE   = False      # ← True w produkcji/HTTPS
CSRF_COOKIE_SAMESITE    = "Lax"
CSRF_COOKIE_SECURE      = False

# --- Statyczne ---
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- E-mail (dev: konsola) ---
EMAIL_BACKEND        = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL   = "noreply@garnuch.local"
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http"   # ← https w prod


FRONTEND_URL = "http://localhost:5173"  # ← https w prod

# --- Logowanie ---
LOGGING = {
    "version": 1,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "payments": {          # ← nazwa pliku apps.py.default_app_config
            "handlers": ["console"],
            "level": "INFO",
        },
    },
}
