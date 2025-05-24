"""
core/adapters.py

Adapter Allauth dla logowania przez GitHub:
- Wymaga zweryfikowanego adresu e-mail
- Obsługuje brak maila (pobranie przez API GitHub)
- Ustawia email.verified=True bez wysyłania linku potwierdzającego
- Przekierowuje użytkownika na adres SPA po udanym logowaniu
"""

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter  # klasa bazowa adaptera
from allauth.socialaccount.providers.github.provider import GitHubProvider  # identyfikator providera GitHub
from django.core.exceptions import ImproperlyConfigured  # wyjątek przy błędnej konfiguracji
import requests  # do wywołań API GitHub

FRONT_URL_AFTER_LOGIN = "http://localhost:5173/home"  # URL frontendu po zalogowaniu


class GarnuchSocialAdapter(DefaultSocialAccountAdapter):
    """
    Adapter dostosowujący logikę OAuth GitHub:
    1) Email zawsze weryfikowany (verified=True)
    2) Jeśli GitHub nie zwróci maila, pobranie z /user/emails
    3) Brak maila → błąd rejestracji
    4) Po sukcesie przekierowanie do FRONT_URL_AFTER_LOGIN
    """

    def pre_social_login(self, request, sociallogin):
        """
        Przed ostatecznym zapisem użytkownika po OAuth:
        - Sprawdza provider
        - Pomija, jeśli konto istnieje
        - Uzupełnia i weryfikuje email
        """
        # Akcja tylko dla GitHub
        if sociallogin.account.provider != GitHubProvider.id:
            return

        # Istniejący użytkownik: pomiń dodatkowe kroki
        if sociallogin.is_existing:
            return

        # Pobranie maila z tokenów GitHub
        email = sociallogin.user.email

        # Jeśli brak maila w payloadzie → pobierz ręcznie przez API
        if not email:
            token = sociallogin.token.token
            try:
                resp = requests.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"token {token}"},
                    timeout=5,
                )
                resp.raise_for_status()
                emails = resp.json()  # lista adresów e-mail z GitHub
            except requests.RequestException as exc:
                # błąd HTTP lub timeout
                raise ImproperlyConfigured(
                    f"Błąd pobierania maili z GitHub: {exc}"
                )
            # wybierz pierwszy zweryfikowany mail (alternatywnie cała lista)
            if emails:
                email = emails[0].get("email")

        # Jeśli nadal brak maila → przerwij rejestrację
        if not email:
            raise ImproperlyConfigured(
                "GitHub nie zwrócił adresu e-mail – rejestracja przerwana."
            )

        # Oznacz email jako primary i verified, zapobiega wysyłaniu linku potwierdzającego
        email_addr = sociallogin.email_addresses[0]
        email_addr.verified = True
        email_addr.primary = True

    def get_login_redirect_url(self, request, socialaccount):
        """
        Po udanym zalogowaniu przekierowanie na frontend SPA.
        """
        return FRONT_URL_AFTER_LOGIN
