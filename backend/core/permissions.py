"""
core/permissions.py

Definiuje niestandardowe uprawnienia DRF:
- IsPremiumUser: dostęp tylko dla zalogowanych i posiadających status premium
"""

from rest_framework.permissions import BasePermission  # klasa bazowa uprawnień

class IsPremiumUser(BasePermission):
    """
    Sprawdza, czy:
    - użytkownik jest uwierzytelniony
    - użytkownik ma is_premium=True
    Zwraca True, jeśli oba warunki spełnione.
    """
    def has_permission(self, request, view):
        # request.user.is_authenticated oraz is_premium muszą być prawdziwe
        return bool(request.user and request.user.is_authenticated and request.user.is_premium)
