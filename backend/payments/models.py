"""
payments/models.py

Model Django przechowujący informacje o płatnościach PayPal:
- user: FK do użytkownika realizującego płatność
- order_id: unikalny identyfikator zamówienia PayPal
- status: stan procesu płatności (created, approved, captured, failed)
- amount: kwota płatności
- currency: waluta (domyślnie USD)
- created, updated: znaczniki czasowe
"""

from django.conf import settings
from django.db import models


class Payment(models.Model):
    STATUS = [
        ("created", "Created"),
        ("approved", "Approved"),       # PayPal – user approved, not captured
        ("captured", "Captured"),       # final OK
        ("failed", "Failed"),
    ]

    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_id  = models.CharField(max_length=64, unique=True)
    status    = models.CharField(max_length=10, choices=STATUS, default="created")
    amount    = models.DecimalField(max_digits=7, decimal_places=2)  # 9999.99 max
    currency  = models.CharField(max_length=3, default="USD")
    created   = models.DateTimeField(auto_now_add=True)
    updated   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_id} – {self.status}"
