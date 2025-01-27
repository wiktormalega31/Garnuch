import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Layout } from "antd";
import "./css/Footer.css"; // Importowanie pliku CSS

const { Footer } = Layout;

function CustomFooter() {
  return (
    <Footer className="custom-footer">
      <div className="footer-content">
        <span className="footer-text">© Garnuch 2025 Projekt Front-End</span>
        <Link
          to="https://github.com/wiktormalega31/Project.git"
          className="footer-link"
        >
          <FaGithub className="footer-icon" />
        </Link>
      </div>
    </Footer>
  );
}

export default CustomFooter;
