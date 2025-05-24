"""
core/admin.py

Rejestracja modeli `Product` i `Favorite` w panelu administracyjnym Django.
Pozwala na przegląd i edycję produktów oraz ulubionych produktów użytkowników.
"""

from django.contrib import admin  # podstawowe narzędzia admina Django
from .models import Product, Favorite  # modele do rejestracji w adminie

# Rejestracja modelu produktu
admin.site.register(Product)
# Rejestracja modelu ulubionych produktów
admin.site.register(Favorite)
