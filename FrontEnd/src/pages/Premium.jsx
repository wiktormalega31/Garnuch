import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, List, Typography, Button, message } from "antd";
import { useAuth } from "../context/AuthContext";
import API, { ensureCsrfCookie } from "../axiosConfig";

const { Title } = Typography;

const FEATURES = [
  "Nieograniczona lista zakupów",
  "Synchronizacja pomiędzy urządzeniami",
  "Brak reklam",
  "Ekskluzywne przepisy każdego tygodnia",
];

function Premium() {
  const { user, refreshUser } = useAuth();
  const [params] = useSearchParams();

  /* ───────── obsługa powrotu z PayPala ───────── */
  useEffect(() => {
    if (params.get("refresh") === "1") {
      refreshUser(); // pobierz świeże is_premium
    }
    if (params.get("err")) {
      const map = {
        cancel: "Transakcja anulowana.",
        capture: "Błąd potwierdzenia płatności.",
        no_token: "Brak identyfikatora zamówienia.",
      };
      message.error(map[params.get("err")] ?? "Nieznany błąd płatności.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // odpal raz po załadowaniu

  /* ───────── start płatności ───────── */
  const goToCheckout = async () => {
    try {
      await ensureCsrfCookie();
      const { data } = await API.post("/payments/start/");
      window.location.href = data.redirect_url; // PayPal/Smart Payment Buttons
    } catch {
      message.error("Nie udało się zainicjować płatności.");
    }
  };

  /* ───────── render ───────── */
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Garnuch&nbsp;Premium
        </Title>

        <List
          size="small"
          dataSource={FEATURES}
          renderItem={(item) => <List.Item>•&nbsp;{item}</List.Item>}
          style={{ marginBottom: "1.5rem" }}
        />

        {user?.is_premium ? (
          <Typography.Paragraph style={{ textAlign: "center" }}>
            Masz już aktywny plan&nbsp;Premium. Dziękujemy&nbsp;❤️
          </Typography.Paragraph>
        ) : (
          <Button type="primary" block size="large" onClick={goToCheckout}>
            Przejdź do płatności
          </Button>
        )}
      </Card>
    </div>
  );
}

export default Premium;
