"""
config/urls.py

Definicja głównych ścieżek URL dla aplikacji backend.
Rejestruje admina, główne API, logowanie OAuth2, ścieżki płatności.
"""

from django.contrib import admin  # panel administracyjny Django
from django.urls import path, include  # funkcje do definiowania tras URL
from core.views import direct_github_login  # widok przekierowujący bezpośrednio na GitHub OAuth

urlpatterns = [
    # Panel administracyjny Django
    path("admin/", admin.site.urls),

    # Główne API aplikacji (przepisy, produkty, autoryzacja)
    path("api/", include("core.urls")),

    # token / sesja – gotowe endpointy dj-rest-auth
    path("auth/", include("dj_rest_auth.urls")),
    # rejestracja przez dj-rest-auth
    path("auth/registration/", include("dj_rest_auth.registration.urls")),

    # allauth – pełny zestaw endpointów OAuth, w tym callback GitHub
    path("accounts/", include("allauth.urls")),

    # Skrót do bezpośredniego logowania przez GitHub (pivot do allauth.oauth2_login)
    path("auth/github-direct/", direct_github_login),

    # Endpointy dotyczące płatności (start, capture, success, cancel)
    path("payments/", include("payments.urls", namespace="payments")),
]
