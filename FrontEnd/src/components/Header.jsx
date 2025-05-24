// src/components/AppLayout.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Pot from "../img/pot.png";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Search from "./Search.jsx";
import { useAuth } from "../context/AuthContext";
import { readPremiumCookie } from "../utils/cookies";
import "./css/Header.css";

const { Header } = Layout;

/* helper – usuń nie-HttpOnly cookie */
const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

function AppLayout() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((p) => !p);

  const onLogOut = async () => {
    try {
      await logout();
    } finally {
      deleteCookie("csrftoken");
      navigate("/login", { replace: true });
    }
  };

  /* -------- klik „Lista zakupów” -------- */
  const handleShoppingClick = () => {
    const isPremium = user?.is_premium ?? readPremiumCookie();

    if (isPremium) {
      navigate("/shoppinglist");
    } else {
      message.info("Funkcja dostępna w wersji Premium.");
      navigate("/premium");
    }
    setOpen(false);
  };

  /* -------- dropdown profilowy -------- */
  const profileMenu = (
    <Menu>
      <Menu.Item key="fav">
        <Link to="/favorites">Ulubione</Link>
      </Menu.Item>
      <Menu.Item key="profile" onClick={() => setOpen(false)}>
        <Link to="/profile">Mój Profil</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={onLogOut}>
        Wyloguj
      </Menu.Item>
    </Menu>
  );

  /* -------- render -------- */
  return (
    <Layout>
      <Header className="header">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={Pot} alt="Logo" className="logo" />
            <span className="logo-text">Garnuch</span>
          </Link>
        </div>

        <Button
          className="hamburger-button"
          type="text"
          icon={<FaBars />}
          onClick={toggleMenu}
        />

        <div className={`menu-container ${open ? "open" : ""}`}>
          <div className="category-list">
            {[
              { to: "/cuisine/european", label: "Europejskie" },
              { to: "/cuisine/vege", label: "Vege" },
              { to: "/cuisine/asian", label: "Azjatyckie" },
              { to: "/cuisine/italian", label: "Włoskie" },
              { to: "/cuisine/all", label: "Wszystkie" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="category-item"
                onClick={() => setOpen(false)}
              >
                <Button className="category-button" block>
                  <h4>{label}</h4>
                </Button>
              </NavLink>
            ))}

            {/* Lista zakupów – warunkowy redirect */}
            <Button
              className="category-button"
              block
              onClick={handleShoppingClick}
            >
              <h4>Lista zakupów</h4>
            </Button>
          </div>

          <Search />

          <Dropdown overlay={profileMenu} trigger={["click"]}>
            <Button icon={<FaUserCircle />} className="profile-button">
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Header>
    </Layout>
  );
}

export default AppLayout;
