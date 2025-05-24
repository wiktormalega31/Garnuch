"""
payments/admin.py

Rejestracja modelu Payment w panelu admina oraz akcje:
- capture_payment: ręczne zatwierdzenie płatności i nadanie statusu premium
- mark_failed: oznaczenie płatności jako nieudanej
"""
from django.contrib import admin, messages  # obsługa rejestracji i powiadomień
from .models import Payment  # model płatności
from .utils import capture_order  # funkcja do zatwierdzenia płatności w PayPal

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # --- kolumny wyświetlane w panelu admin ---
    list_display = ('order_id', 'user', 'amount', 'currency', 'status', 'created', 'updated')
    list_filter = ('status', 'currency')
    actions = ['capture_payment', 'mark_failed']

    def capture_payment(self, request, queryset):
        """
        Akcja admina: próba zatwierdzenia wybranych płatności.
        - Dla każdej płatności wywołuje capture_order
        - On success: ustaw status='captured' i user.is_premium=True
        - On failure: zgłaszany błąd i status pozostaje lub zostaje "failed"
        """
        success_count = 0
        fail_count = 0
        for payment in queryset:
            try:
                capture_order(payment.order_id)
                payment.status = 'captured'
                payment.user.is_premium = True
                payment.user.save(update_fields=['is_premium'])
                payment.save(update_fields=['status'])
                success_count += 1
            except Exception:
                fail_count += 1
                self.message_user(request, f"Nie udało się zatwierdzić płatności {payment.order_id}", level=messages.ERROR)
        if success_count:
            self.message_user(request, f"Zatwierdzono {success_count} płatności.", level=messages.SUCCESS)
        if fail_count:
            self.message_user(request, f"Nie udało się zatwierdzić {fail_count} płatności.", level=messages.ERROR)
    capture_payment.short_description = "Zatwierdź wybrane płatności"

    def mark_failed(self, request, queryset):
        """
        Akcja admina: masowe oznaczenie zaznaczonych płatności jako 'failed'.
        """
        updated = queryset.update(status='failed')
        self.message_user(request, f"Oznaczono {updated} płatności jako nieudane.", level=messages.WARNING)
    mark_failed.short_description = "Oznacz wybrane płatności jako nieudane"
