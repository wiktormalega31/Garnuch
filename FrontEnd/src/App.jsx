// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Pages from "./pages/Pages";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConfirmEmail from "./pages/ConfirmEmail";

import { Spin } from "antd"; // mały loader Ant Design
import "./App.css"; // opcjonalnie: styl dla .app-loading

function App() {
  const { user, loading } = useAuth(); // ➊ pobieramy też loading

  /* ➋  dopóki nie wiemy, czy sesja istnieje, pokazujemy spinner */
  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* ➌ jeśli brak usera ➜ tylko logowanie */}
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route
            path="/account-confirm-email/:uid/:token"
            element={<ConfirmEmail />}
          />
          ;
        </Routes>
      ) : (
        /* ➍ zalogowany ➜ pełny layout z Header, Footer i routami aplikacji */
        <>
          <Header />
          <Routes>
            <Route path="/*" element={<Pages />} />
          </Routes>
          <Footer />
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
