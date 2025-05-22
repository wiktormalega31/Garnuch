import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PaymentButton = () => (
  <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
    <PayPalButtons
      createOrder={(data, actions) =>
        actions.order.create({ purchase_units: [{ amount: { value: "10.00" } }] })
      }
      onApprove={(data, actions) =>
        actions.order.capture().then((details) => {
          fetch(`${process.env.REACT_APP_API_URL}/paypal/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
        })
      }
    />
  </PayPalScriptProvider>
);

export default PaymentButton;
