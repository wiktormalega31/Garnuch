"""
users/admin.py

Konfiguracja panelu administracyjnego dla modelu CustomUser:
- list_display: kolumny wyświetlane
- list_filter: filtry w bocznym panelu
- akcje masowe: verify_user, deactivate_user, set_premium, unset_premium
"""

from django.contrib import admin, messages  # narzędzia admin panelu Django
from .models import CustomUser  # niestandardowy model użytkownika

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    """
    Admin panel dla CustomUser:
    - Weryfikacja maila
    - Dezaktywacja konta
    - Nadawanie / odbieranie statusu premium
    """

    list_display = ('username', 'email', 'is_active', 'is_premium')
    list_filter = ('is_active', 'is_premium', 'is_staff')
    actions = ['verify_user', 'deactivate_user', 'set_premium', 'unset_premium']

    def verify_user(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Zatwierdzono weryfikację {updated} użytkowników.", level=messages.SUCCESS)
    verify_user.short_description = "Zatwierdź weryfikację wybranych użytkowników"

    def deactivate_user(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Dezaktywowano {updated} użytkowników.", level=messages.WARNING)
    deactivate_user.short_description = "Dezaktywuj wybranych użytkowników"
   
    def set_premium(self, request, queryset):
        updated = queryset.update(is_premium=True)
        self.message_user(request, f"Nadałeś status Premium {updated} użytkownikom.", level=messages.SUCCESS)
    set_premium.short_description = "Nadaj status Premium wybranym użytkownikom"

    def unset_premium(self, request, queryset):
        updated = queryset.update(is_premium=False)
        self.message_user(request, f"Odebrano status Premium {updated} użytkownikom.", level=messages.WARNING)
    unset_premium.short_description = "Odbierz status Premium wybranym użytkownikom"
