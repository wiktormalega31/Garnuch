"""
core/serializers.py

Serializery dla REST API:
- ProductSerializer: serializacja modelu Product
- FavoriteSerializer: serializacja modelu Favorite
- FavoriteRecipeSerializer: serializacja ulubionych przepisów
"""

from rest_framework import serializers  # DRF serializery
from .models import Product, Favorite, FavoriteRecipe
from rest_framework.permissions import BasePermission  # (zbędne w serializerach)


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializuje wszystkie pola modelu Product:
    name, description, price
    """
    class Meta:
        model = Product
        fields = '__all__'  # wszystkie pola


class FavoriteSerializer(serializers.ModelSerializer):
    """
    Serializacja modelu Favorite:
    - product musisz podać
    - user jest read-only, ustawiany automatycznie
    """
    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ['user']  # user nadpisywany w perform_create


class IsPremiumUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_premium)


class FavoriteRecipeSerializer(serializers.ModelSerializer):
    """
    Serializacja modelu FavoriteRecipe:
    pola: recipe_id, title, image
    """
    class Meta:
        model = FavoriteRecipe
        fields = ["recipe_id", "title", "image"]