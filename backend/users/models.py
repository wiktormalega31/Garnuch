"""
users/models.py

Model niestandardowego użytkownika (CustomUser):
Dziedziczy po AbstractUser, dodaje pole:
- is_premium: informuje, czy użytkownik ma zarejestrowany status premium
"""
from django.contrib.auth.models import AbstractUser  # bazowy model użytkownika Django
from django.db import models  # pola modeli Django


class CustomUser(AbstractUser):
    """
    Rozszerzony model użytkownika Django:
    - dodaje pole boolean `is_premium` ustawiane dla płatnych kont premium
    Domyślnie False.
    """
    is_premium = models.BooleanField(default=False)  # status premium
