import base64
import requests
from django.conf import settings

# ——— end-pointy PayPal ———
PAYPAL_OAUTH  = "https://api-m.paypal.com/v1/oauth2/token"
PAYPAL_ORDERS = "https://api-m.paypal.com/v2/checkout/orders"
if settings.PAYPAL_MODE == "sandbox":
    PAYPAL_OAUTH  = PAYPAL_OAUTH.replace("api-m.", "api-m.sandbox.")
    PAYPAL_ORDERS = PAYPAL_ORDERS.replace("api-m.", "api-m.sandbox.")


# ——— token aplikacji ———
def _auth_header():
    creds = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}"
    basic = base64.b64encode(creds.encode()).decode()
    return {"Authorization": f"Basic {basic}"}


def get_access_token():
    r = requests.post(
        PAYPAL_OAUTH,
        headers=_auth_header(),
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()["access_token"]


# ——— utworzenie zamówienia ———
def create_order(amount, currency, return_url, cancel_url):
    token   = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {"amount": {"currency_code": currency, "value": amount}}
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }
    r = requests.post(PAYPAL_ORDERS, json=payload, headers=headers, timeout=10)
    r.raise_for_status()
    data    = r.json()
    approve = next(l["href"] for l in data["links"] if l["rel"] == "approve")
    return data["id"], approve


# ——— capture po stronie serwera ———
import logging
logger = logging.getLogger(__name__)

def capture_order(order_id):
    token   = get_access_token()
    headers = {"Authorization": f"Bearer {token}",
               "Content-Type":  "application/json",   # ← DODANE
}

    r = requests.post(
        f"{PAYPAL_ORDERS}/{order_id}/capture",
        json={},
        headers=headers,
        timeout=10,
    )

    # ←──── LOGUJ WSZYSTKO, żeby widzieć co PayPal zwraca
    logger.info("PayPal capture %s status=%s body=%s",
                order_id, r.status_code, r.text[:1000])

    r.raise_for_status()          # podniesie wyjątek przy 4xx/5xx
    return r.json()