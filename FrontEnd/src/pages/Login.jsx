import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";

const Login = () => {
  const [loginMode, setLoginMode] = useState("email"); // "email", "username", "register"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!isValidEmail(email)) {
      setError("Podaj prawidłowy adres email.");
      return;
    }

    try {
      await register(username, email, password);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Wystąpił problem z rejestracją.";
      setError(msg);
    }
  };

  const handleLogin = async () => {
    console.log("Kliknięto ZALOGUJ");

    if (!password) {
      setError("Podaj hasło.");
      return;
    }

    try {
      await login(loginMode === "email" ? email : username, password);
      console.log("Login zakończony");
      navigate("/home"); // Przekierowanie po udanym logowaniu
    } catch (err) {
      console.error("Błąd logowania", err);
      setError("Nieprawidłowy login/email lub hasło.");
    }
  };

  return (
    <PageWrapper>
      <LoginWrapper>
        <h2>{loginMode === "register" ? "Rejestracja" : "Logowanie"}</h2>
        <TabWrapper>
          <Tab
            isActive={loginMode === "email"}
            onClick={() => setLoginMode("email")}
          >
            Email
          </Tab>
          <Tab
            isActive={loginMode === "username"}
            onClick={() => setLoginMode("username")}
          >
            Login
          </Tab>
          <Tab
            isActive={loginMode === "register"}
            onClick={() => setLoginMode("register")}
          >
            Rejestracja
          </Tab>
        </TabWrapper>
        <FormWrapper>
          {loginMode === "register" || loginMode === "email" ? (
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <Input
              type="text"
              placeholder="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          {loginMode === "register" && (
            <Input
              type="text"
              placeholder="Nazwa użytkownika"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <Input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button
            onClick={loginMode === "register" ? handleRegister : handleLogin}
          >
            {loginMode === "register" ? "Zarejestruj się" : "Zaloguj się"}
          </Button>
        </FormWrapper>
      </LoginWrapper>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  padding: 2rem;
  background-color: #ebe6e6;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border: 1px solid #5b422c;
  position: relative;
`;

const TabWrapper = styled.div`
  margin: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  top: -2.5rem;
  background-color: #ebe6e6;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const Tab = styled.div`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  flex: 1;
  text-align: center;
  padding: 0.6rem 1rem;
  cursor: pointer;
  background-color: ${(props) => (props.isActive ? "#5b422c" : "#ddd")};
  color: ${(props) => (props.isActive ? "white" : "#5b422c")};
  border: 1px solid #5b422c;
  transition: 0.3s;

  &:hover {
    background-color: #5b422c;
    color: white;
  }
`;

const FormWrapper = styled.div`
  margin-top: 1.5rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 1rem;
  margin: 0.5rem 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 1rem;
  background-color: #5b422c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

export default Login;
