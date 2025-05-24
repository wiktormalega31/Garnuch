"""
payments/views.py

Widoki przetwarzające płatności PayPal:
- StartPayment: tworzy zamówienie i zwraca URL do przekierowania na PayPal
- CapturePayment: zatwierdza płatność po stronie serwera (onApprove)
- SuccessReturn: obsługa redirectu po udanym płatności (GET /success/)
- CancelReturn: obsługa redirectu po anulowaniu płatności (GET /cancel/)
"""

from django.conf import settings  # ustawienia projektu
from django.http import HttpResponseRedirect  # przekierowania HTTP
from django.shortcuts import get_object_or_404  # pomocniczo pobieranie obiektu lub 404
from django.urls import reverse  # budowanie URL z nazw
from rest_framework.views import APIView  # bazowy widok DRF
from rest_framework.permissions import IsAuthenticated  # sprawdza uwierzytelnienie
from rest_framework.response import Response  # zwraca JSON DRF
from rest_framework import status  # kody HTTP DRF

from .models import Payment  # model płatności
from .utils import create_order, capture_order  # funkcje do komunikacji z PayPal


class StartPayment(APIView):
    """
    POST /payments/start/
    • Tworzy zamówienie PayPal (order_id)
    • Zapisuje rekord Payment w bazie z status='created'
    • Zwraca URL do strona z zatwierdzeniem płatności
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Przygotowanie URL zwrotnych dla PayPal
        return_url = request.build_absolute_uri(reverse("payments:success"))
        cancel_url = request.build_absolute_uri(reverse("payments:cancel"))

        # Utworzenie zamówienia przez API PayPal
        order_id, approve_url = create_order(
            amount="5.99",
            currency="USD",
            return_url=return_url,
            cancel_url=cancel_url,
        )

        # Zapisanie rekordu Payment w DB
        Payment.objects.create(
            user=request.user,
            order_id=order_id,
            amount="5.99",
            currency="USD",
            status="created",
        )
        # Zwrócenie URL do przekierowania klienta
        return Response({"redirect_url": approve_url})


class CapturePayment(APIView):
    """
    POST /payments/capture/
    • Zatwierdza zamówienie na serwerze (używane przez front-end onApprove)
    • On error: status='failed', kod 502
    • On success: status='captured', nadaje status premium użytkownikowi
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        # Pobranie istniejącego rekordu lub 404
        pay = get_object_or_404(Payment, order_id=order_id, user=request.user)

        try:
            capture_order(order_id)  # wywołanie PayPal API
        except Exception:
            # Oznaczenie nieudanego przechwycenia
            pay.status = "failed"
            pay.save(update_fields=["status"])
            return Response({"detail": "capture-failed"}, status=502)

        # Zaktualizuj status i nadaj premium
        pay.status = "captured"
        pay.save(update_fields=["status"])
        request.user.is_premium = True
        request.user.save(update_fields=["is_premium"])
        return Response({"detail": "ok"})


class SuccessReturn(APIView):
    """
    GET /payments/success/?token=<ORDER_ID>
    • PayPal przekierowuje tutaj po zatwierdzeniu płatności przez użytkownika
    • Jeśli brak tokena: redirect na frontend z błędem
    • Capturing: ponownie capture_order (synchronizacja)
    • On success: nadaje premium i redirect do shoppinglist
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        token = request.GET.get("token")
        if not token:
            # Brak parametru token → przekierowanie z błędem
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/premium?err=no_token")

        pay = Payment.objects.filter(order_id=token).select_related("user").first()
        if not pay:
            # Nie znaleziono płatności → po prostu kontynuuj frontend
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/shoppinglist")

        try:
            capture_order(token)
        except Exception:
            # Niepowodzenie capture → oznaczenie i redirect z błędem
            pay.status = "failed"
            pay.save(update_fields=["status"])
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/premium?err=capture")

        # Powodzenie → oznaczenie i nadanie premium
        pay.status = "captured"
        pay.save(update_fields=["status"])
        pay.user.is_premium = True
        pay.user.save(update_fields=["is_premium"])

        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/shoppinglist")


class CancelReturn(APIView):
    """
    GET /payments/cancel/
    • PayPal przekierowuje tutaj po anulowaniu płatności
    • Redirect do frontend z komunikatem anulowania
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/premium?err=cancel")
