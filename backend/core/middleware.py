"""
core/middleware.py

Middleware 'PremiumStatusCookieMiddleware':
- Dla zalogowanego użytkownika zapisuje signed cookie 'premiumstatus' z wartością 'true' lub 'false'.
- Dla niezalogowanego usuwa cookie 'premiumstatus'.
- Cookie chronione HMAC + SECRET_KEY, można odczytać w JS, ale nie sfałszować.
"""

from django.conf import settings  # import ustawień Django
from django.utils.deprecation import MiddlewareMixin  # klasa bazowa middleware


class PremiumStatusCookieMiddleware(MiddlewareMixin):
    """
    Dodaje lub usuwa cookie 'premiumstatus' w zależności od statusu użytkownika:
    signed cookie: ścieżka '/', max_age = 30 dni, secure = zależnie od DEBUG, samesite=Lax
    """

    COOKIE = "premiumstatus"  # nazwa cookie
    MAX_AGE = 60 * 60 * 24 * 30  # ważność cookie: 30 dni w sekundach
    SAME_SITE = "Lax"  # polityka SameSite
    SECURE_FLAG = not settings.DEBUG  # secure=true tylko w produkcji

    def process_response(self, request, response):
        """
        Ustawia cookie premiumstatus po każdym żądaniu:
        - jeśli użytkownik jest zalogowany → zapisuje wartość
        - jeśli nie → usuwa cookie
        """
        user = getattr(request, "user", None)

        if user and user.is_authenticated:
            # wartość jako string 'true' lub 'false'
            value = "true" if user.is_premium else "false"
            response.set_signed_cookie(
                self.COOKIE,
                value,
                max_age=self.MAX_AGE,
                path="/",
                secure=self.SECURE_FLAG,
                samesite=self.SAME_SITE,
            )
        else:
            # usuń cookie jeśli brak uwierzytelnienia
            response.delete_cookie(self.COOKIE, path="/")

        return response
