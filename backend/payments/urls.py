"""
payments/urls.py

Definicja tras URL dla modułu płatności PayPal:
- start: rozpoczęcie płatności
- capture: zatwierdzenie płatności po stronie serwera
- success: zwrot od PayPal po udanym płaceniu
- cancel: zwrot od PayPal po anulowaniu płatności
"""

from django.urls import path
from . import views

app_name = "payments"  # namespace dla reversów URL

urlpatterns = [
    # Rozpoczęcie płatności: generuje order_id i URL przekierowania na PayPal
    path("start/", views.StartPayment.as_view(), name="start"),
    # Zatwierdzenie płatności po stronie serwera (dla onApprove w frontend)
    path("capture/", views.CapturePayment.as_view(), name="capture"),

    # Endpoints służące do obsługi zwrotów z PayPal
    # PayPal redirectuje GET /success/?token=<ORDER_ID>
    path("success/", views.SuccessReturn.as_view(), name="success"),
    # PayPal redirectuje GET /cancel/
    path("cancel/",  views.CancelReturn.as_view(),  name="cancel"),
]
