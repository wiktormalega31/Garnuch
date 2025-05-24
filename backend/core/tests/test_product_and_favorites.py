import pytest
from django.urls import reverse
from rest_framework import status
from core.models import Product, Favorite

@pytest.mark.django_db
def test_product_list(api_client):
    # given
    Product.objects.create(name="Prod1", description="D1", price="5.00")
    Product.objects.create(name="Prod2", description="D2", price="10.00")
    url = reverse('product-list')
    # when
    resp = api_client.get(url)
    # then
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 2
    names = [item['name'] for item in data]
    assert set(names) == {"Prod1", "Prod2"}

@pytest.mark.django_db
def test_favorite_list_requires_premium(auth_client):
    # user.is_premium is False by default
    url = reverse('favorite-list-create')
    resp = auth_client.get(url)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_favorite_list_and_create(auth_client, user):
    # grant premium
    user.is_premium = True
    user.save(update_fields=['is_premium'])
    product = Product.objects.create(name="P", description="D", price="1.23")
    url = reverse('favorite-list-create')
    # initially empty
    resp = auth_client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []
    # create favorite
    resp = auth_client.post(url, {'product': product.id})
    assert resp.status_code == status.HTTP_201_CREATED
    out = resp.json()
    assert out['product'] == product.id
    assert out['user'] == user.id
    # now list contains one
    resp = auth_client.get(url)
    assert len(resp.json()) == 1
    assert resp.json()[0]['product'] == product.id
