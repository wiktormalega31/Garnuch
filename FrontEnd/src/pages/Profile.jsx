import { Typography, Spin, Button, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API, { ensureCsrfCookie } from "../axiosConfig";
import "./css/Profile.css";

const { Title, Text } = Typography;

function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Text>Brak danych użytkownika.</Text>;
  }

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Na pewno chcesz usunąć konto? Tej operacji nie można cofnąć."
      )
    )
      return;
    try {
      await ensureCsrfCookie();
      await API.delete("/auth/user/");
      message.success("Konto zostało usunięte.");
      await logout();
      navigate("/login");
    } catch {
      message.error("Nie udało się usunąć konta.");
    }
  };

  // compute registration date or fallback
  const regDate = user.date_joined ? user.date_joined.split(" ")[0] : "-";

  return (
    <div className="profile-container">
      <Title level={2} className="profile-title">
        Mój Profil
      </Title>
      <Text className="profile-item">
        <strong>Nazwa użytkownika:</strong> {user.username}
      </Text>
      <Text className="profile-item">
        <strong>Email:</strong> {user.email}
      </Text>
      <Text className="profile-item">
        <strong>Data rejestracji:</strong>{" "}
        <span className="profile-date">{regDate}</span>
      </Text>
      <Text className="profile-item">
        <strong>Premium:</strong>{" "}
        <span className="profile-status">
          {user.is_premium ? "Tak" : "Nie"}
        </span>
      </Text>
      <Button
        danger
        block
        className="profile-delete-button"
        onClick={deleteAccount}
      >
        Usuń konto
      </Button>
    </div>
  );
}

export default Profile;
