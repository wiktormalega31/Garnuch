import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class PaypalPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('orderID')
        access_token = self.get_access_token()
        r = requests.get(
            f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        order_data = r.json()
        if order_data.get("status") == "COMPLETED":
            request.user.is_premium = True
            request.user.save()
            return Response({"status": "Payment confirmed, premium granted"})
        else:
            return Response({"status": "Payment failed"}, status=400)

    def get_access_token(self):
        r = requests.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
        )
        return r.json()['access_token']
