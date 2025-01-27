import { useState, useEffect } from "react";
import Pages from "./pages/Pages";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import "./App.css";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (email) => {
    console.log("Login successful, setting authentication...");
    setIsAuthenticated(true);
    localStorage.setItem("user", email);
  };

  return (
    <div className="app-container">
      <BrowserRouter>
        <div className="main-content">
          {isAuthenticated ? (
            <>
              <Header />
              <Pages />
              <Footer />
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
