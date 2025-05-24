"""
core/views.py

Ten plik zawiera definicje widoków REST API dla:
- produktów i ulubionych produktów
- autoryzacji GitHub (dj-allauth + CSRF)
- proxy do API Spoonacular z cache (24h)
"""

from datetime import timedelta
import logging
import os

from allauth.socialaccount.providers.github.views import oauth2_login
from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Product, Favorite, RecipeCache, FavoriteRecipe
from .serializers import ProductSerializer, FavoriteSerializer, FavoriteRecipeSerializer
from .permissions import IsPremiumUser
from .utils import fetch_from_spoonacular
from django.db import transaction

# ───────────────────────────── logger → api.log ──────────────────────────────
LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "api.log")
logger = logging.getLogger("spoonacular")
if not logger.handlers:
    # Konfiguracja loggera: INFO + plik api.log
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(LOG_FILE)
    fh.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
    logger.addHandler(fh)


def sp_fetch(endpoint: str, *, params: dict | None = None):
    """
    Pomocnicza funkcja logująca każde zapytanie do Spoonacular.
    - Pobiera dane przez fetch_from_spoonacular
    - Zapisuje endpoint, parametry i status (OK / ERROR)
    - Zwraca otrzymany JSON (dict lub listę)
    """
    data = fetch_from_spoonacular(endpoint, params=params)
    status_msg = "OK" if "error" not in data else f"ERROR:{data['error']}"
    logger.info("%s params=%s -> %s", endpoint, params or {}, status_msg)
    return data


# ─────────────────────────────────────────────────────────────────────────────
#  1. Produkty i ulubione
# ─────────────────────────────────────────────────────────────────────────────
class ProductList(generics.ListAPIView):
    """
    GET /api/products/
    Zwraca listę wszystkich produktów.
    Domyślnie dostępne dla zalogowanego użytkownika.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class FavoriteListCreate(generics.ListCreateAPIView):
    """
    GET /api/products/favorites/  – lista ulubionych produktów użytkownika premium
    POST /api/products/favorites/ – dodanie ulubionego produktu (premium wymaga uprawnień)
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsPremiumUser]  # tylko użytkownicy premium

    def get_queryset(self):
        # Filtracja ulubionych produktów dla aktualnego użytkownika
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Podczas tworzenia automatycznie przypisz user=a request.user
        serializer.save(user=self.request.user)


# ─────────────────────────────────────────────────────────────────────────────
#  2. GitHub login + CSRF
# ─────────────────────────────────────────────────────────────────────────────
def direct_github_login(request: HttpRequest):
    """
    Redirect do endpointu allauth GitHub OAuth2.
    Umożliwia proste przekierowanie z frontendu na GitHub.
    """
    return oauth2_login(request)


@ensure_csrf_cookie
def csrf(request: HttpRequest):
    """
    GET /api/csrf/
    Ustawia cookie 'csrftoken' na odpowiedzi.
    Przydatne dla frontendu do pobrania CSRF tokena.
    """
    response = JsonResponse({"detail": "CSRF cookie set"})
    return response


# ─────────────────────────────────────────────────────────────────────────────
#  3. Spoonacular-proxy (cache 24 h)
# ─────────────────────────────────────────────────────────────────────────────
CACHE_TTL = timedelta(hours=24)  # czas życia cache

class RecipeInfo(APIView):
    """
    GET /api/recipes/<int:spoon_id>/
    - Pobiera szczegóły pojedynczego przepisu
    - Używa cache w DB (aktualizuje co 24h lub przy pierwszym wywołaniu)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, spoon_id: int):
        cache, created = RecipeCache.objects.get_or_create(spoon_id=spoon_id)
        expired = created or cache.updated_at < timezone.now() - CACHE_TTL

        if expired:
            # Pobranie przez bulk, bo niby szybciej w jednej paczce
            data = sp_fetch("/recipes/informationBulk", params={"ids": spoon_id})
            if "error" in data:
                # Przy błędzie: zwróć istniejący cache lub błąd 503
                if not created:
                    return Response(cache.json)
                return Response({"detail": "Limit Spoonacular / błąd"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            cache.json = data[0] if isinstance(data, list) else data
            cache.save()

        return Response(cache.json)


class RecipeBulk(APIView):
    """
    GET /api/recipes/bulk/?ids=1,2,3
    - Pobiera listę przepisów po ich ID (max 10)
    - Łączy cache i ewentualne odwołanie do API dla brakujących
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Parsowanie parametru ids
        ids = [int(i) for i in request.query_params.get("ids", "").split(",") if i.isdigit()][:10]
        if not ids:
            return Response([])

        result, missing = [], []
        for rid in ids:
            try:
                c = RecipeCache.objects.get(spoon_id=rid)
                if c.updated_at >= timezone.now() - CACHE_TTL:
                    result.append(c.json)
                else:
                    missing.append(rid)
            except RecipeCache.DoesNotExist:
                missing.append(rid)

        if missing:
            data = sp_fetch(
                "/recipes/informationBulk",
                params={"ids": ",".join(map(str, missing))},
            )
            if "error" not in data:
                for item in data:
                    RecipeCache.objects.update_or_create(
                        spoon_id=item["id"], defaults={"json": item}
                    )
                id_map = {j["id"]: j for j in data}
                result.extend(id_map[r] for r in missing if r in id_map)

        ordered = [next(j for j in result if j["id"] == rid) for rid in ids if any(j["id"] == rid for j in result)]
        return Response(ordered)


class SearchCuisine(APIView):
    """
    GET /api/cuisine/?name=<cuisine>&number=<n>&diet=<diet>
    - Wyszukiwanie przepisów wg kuchni, diet, limit
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        name = request.query_params.get("name", "")
        number = int(request.query_params.get("number", 10))
        diet = request.query_params.get("diet", "")
        data = sp_fetch("/recipes/complexSearch", params={"cuisine": name, "number": number, "diet": diet})
        return Response(data.get("results", []) if "error" not in data else [])


class SearchQuery(APIView):
    """
    GET /api/search/?query=<tekst>&number=<n>
    - Wyszukiwanie przepisów wg zapytania tekstowego
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get("query", "")
        number = int(request.query_params.get("number", 10))
        data = sp_fetch("/recipes/complexSearch", params={"query": query, "number": number})
        return Response(data.get("results", []) if "error" not in data else [])


class RandomRecipes(APIView):
    """
    GET /api/random/?number=<n>
    - Pobiera losowe przepisy (do number)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        number = int(request.query_params.get("number", 12))
        data = sp_fetch("/recipes/random", params={"number": number})
        return Response(data.get("recipes", []) if "error" not in data else [])
    
class RecipeInfo(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, spoon_id: int):
        try:
            cache = RecipeCache.objects.get(spoon_id=spoon_id)
            fresh = cache.updated_at >= timezone.now() - CACHE_TTL
            if fresh:
                return Response(cache.json)
        except RecipeCache.DoesNotExist:
            cache = None

        # ── nie ma świeżego cache’u → pobierz z Spoonacular ──
        data = sp_fetch("/recipes/informationBulk", params={"ids": spoon_id})

        if "error" in data or not data:
            # brak danych → zwróć stary cache albo 503
            if cache:
                return Response(cache.json)
            return Response(
                {"detail": "Limit zapytań do Spoonacular wyczerpany."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        recipe_json = data[0] if isinstance(data, list) else data

        # ── zapisz/aktualizuj cache atomowo ──
        with transaction.atomic():
            RecipeCache.objects.update_or_create(
                spoon_id=recipe_json["id"],
                defaults={"json": recipe_json},
            )

        return Response(recipe_json)

@login_required
def latest_recipes(request):
    # Pobierz ostatnie przepisy przeglądane przez użytkownika
    latest = RecipeCache.objects.order_by('-updated_at')[:10]
    data = [
        {
            "id": recipe.spoon_id,
            "title": recipe.json.get("title"),
            "image": recipe.json.get("image"),
        }
        for recipe in latest
    ]
    return JsonResponse(data, safe=False)

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def favorite_recipes(request):
    print("=== favorite_recipes called ===")
    print("Method:", request.method)
    print("User:", request.user)
    headers = {k: v for k, v in request.META.items() if k.startswith("HTTP_")}
    print("Headers:", headers)
    if request.method == "POST":
        print("=== POST request received ===")
        print("User:", request.user)
        print("Data:", request.data)
        print("Headers:", {k: v for k, v in request.META.items() if k.startswith("HTTP_")})

    if request.method == "GET":
        qs = FavoriteRecipe.objects.filter(user=request.user)
        return Response(FavoriteRecipeSerializer(qs, many=True).data)

    if request.method == "POST":
        ser = FavoriteRecipeSerializer(data=request.data)
        if ser.is_valid():
            ser.save(user=request.user)  # Przypisz użytkownika do przepisu
            return Response(ser.data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        rid = request.query_params.get("id")
        FavoriteRecipe.objects.filter(user=request.user, recipe_id=rid).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)