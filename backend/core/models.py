"""
core/models.py

Definicja modeli Django dla aplikacji:
- Product: produkty dostępne w API
- Favorite: ulubione produkty przypisane do użytkownika premium
- RecipeCache: cache pojedynczego przepisu z Spoonacular (odśw. co 24h)
- FavoriteRecipe: ulubione przepisy użytkownika (dla premium)
"""

from django.db import models  # bazy danych
from django.conf import settings  # dostęp do AUTH_USER_MODEL


class Product(models.Model):
    """
    Model produktu:
    - name: nazwa
    - description: opis HTML/text
    - price: cena jako Decimal
    """
    name = models.CharField(max_length=255)  # nazwa produktu
    description = models.TextField()  # szczegółowy opis
    price = models.DecimalField(max_digits=10, decimal_places=2)  # cena max 99999999.99

    def __str__(self):
        return self.name  # reprezentacja tekstowa


class Favorite(models.Model):
    """
    Ankieta ulubionych produktów:
    - user: FK do CustomUser
    - product: FK do Product
    unikaty (user, product) dzięki unique_together
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )

    class Meta:
        unique_together = ('user', 'product')  # unikalne pary

    def __str__(self):
        return f"{self.user} -> {self.product}"


class RecipeCache(models.Model):
    """
    Cache przepisu z Spoonacular:
    - spoon_id: identyfikator przepisu w Spoonacular (unique)
    - json: zapisany JSON z API
    - updated_at: automatyczne znacznik ostatniej aktualizacji
    kolejność domyślnie po updated_at malejąco
    """
    spoon_id = models.PositiveIntegerField(unique=True)  # id przepisu
    json = models.JSONField()  # zapamiętany JSON odpowiedzi
    updated_at = models.DateTimeField(auto_now=True)  # data ostatniej aktualizacji

    class Meta:
        ordering = ["-updated_at"]  # nowsze na górze

    def __str__(self):
        return f"Recipe {self.spoon_id}"


class FavoriteRecipe(models.Model):
    """
    Model ulubionych przepisów użytkownika premium:
    - user: FK do CustomUser
    - recipe_id: id w Spoonacular
    - title: tytuł przepisu
    - image: URL do obrazka
    unikat (user, recipe_id)
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_recipes"
    )
    recipe_id = models.PositiveIntegerField()  # identyfikator przepisu z API
    title = models.CharField(max_length=255)  # nazwa przepisu
    image = models.URLField()  # URL obrazka

    class Meta:
        unique_together = ('user', 'recipe_id')

    def __str__(self):
        return f"{self.user} -> Recipe {self.recipe_id}"
