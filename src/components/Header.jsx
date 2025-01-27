/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import Pot from "../img/pot.png"; // Twoje logo
import { FaBars, FaUserCircle } from "react-icons/fa"; // Ikona hamburgera i ikona profilu
import { Layout, Menu, Dropdown, Button, Drawer } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Search from "./Search.jsx";
import "./css/Header.css";

const { Header } = Layout;

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Stan do obsługi rozwijanego menu
  const [timeoutId, setTimeoutId] = useState(null); // Stan dla timeout ID
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Stan dla szerokości okna

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const onLogOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      // Close profile menu after delay (no state to manage here)
    }, 500); // Adjust the delay as needed
    setTimeoutId(id);
  };

  const profileMenu = (
    <Menu>
      <Menu.Item>
        <Link to="/favorites">Ulubione</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/profile">Mój profil</Link>
      </Menu.Item>
      <Menu.Item onClick={onLogOut}>Wyloguj</Menu.Item>
    </Menu>
  );

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
        <div className={`menu-container ${isMenuOpen ? "open" : ""}`}>
          <div className="category-list">
            <NavLink to={"/cuisine/vege"} className="category-item">
              <Button className="category-button" block>
                <h4>Vege</h4>
              </Button>
            </NavLink>
            <NavLink to={"/cuisine/asian"} className="category-item">
              <Button className="category-button" block>
                <h4>Azjatyckie</h4>
              </Button>
            </NavLink>
            <NavLink to={"/cuisine/italian"} className="category-item">
              <Button className="category-button" block>
                <h4>Włoskie</h4>
              </Button>
            </NavLink>
            <NavLink to={"/cuisine/all"} className="category-item">
              <Button className="category-button" block>
                <h4>Wszystkie</h4>
              </Button>
            </NavLink>
            <NavLink to={"/shoppinglist"} className="category-item">
              <Button className="category-button" block>
                <h4>Lista zakupów</h4>
              </Button>
            </NavLink>
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
