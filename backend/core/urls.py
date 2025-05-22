from django.urls import path
from .views import ProductList, FavoriteListCreate

urlpatterns = [
    path('', ProductList.as_view()),
    path('favorites/', FavoriteListCreate.as_view()),
]
