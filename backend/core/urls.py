"""
core/urls.py

Definicja endpointów REST API dla modułu core:
- produkty i ulubione produkty
- CSRF i logowanie GitHub
- proxy do Spoonacular (przepisy)
- dodatkowe widoki: latest_recipes, favorite_recipes
"""

from django.urls import path
from .views import (
    ProductList, FavoriteListCreate, csrf, direct_github_login,
    RecipeInfo, RecipeBulk, SearchCuisine, SearchQuery, RandomRecipes, latest_recipes, favorite_recipes
)

urlpatterns = [
    # produkty / ulubione
    path("products/", ProductList.as_view(), name='product-list'),
    path("products/favorites/", FavoriteListCreate.as_view(), name='favorite-list-create'),

    # auth utils
    path("csrf/", csrf),
    path("auth/github-direct/", direct_github_login),

    # spoonacular-proxy
    path("recipes/<int:spoon_id>/", RecipeInfo.as_view()),
    path("recipes/bulk/",           RecipeBulk.as_view()),
    path("cuisine/",                SearchCuisine.as_view()),
    path("search/",                 SearchQuery.as_view()),
    path("random/",                 RandomRecipes.as_view()),

    # latest recipes
    path('api/recipes/latest/', latest_recipes, name='latest_recipes'),

    # ulubione przepisy
    path("recipes/favorites/", favorite_recipes, name="favorite_recipes"),
]
