from rest_framework import generics, permissions
from .models import Product, Favorite
from .serializers import ProductSerializer, FavoriteSerializer
from .permissions import IsPremiumUser

class ProductList(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class FavoriteListCreate(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsPremiumUser]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
