/* eslint-disable no-unused-vars */
import { useState } from "react";
import styled from "styled-components";

// eslint-disable-next-line react/prop-types
const Login = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState("email"); // "email", "username" or "register"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      const response = await fetch("http://localhost:5000/users");
      const users = await response.json();

      const userExists = users.some(
        (user) => user.email === email || user.username === username
      );

      if (userExists) {
        setError("Użytkownik o takim emailu lub nazwie już istnieje.");
        return;
      }

      const newUser = {
        email,
        username,
        password,
        favoriteRecipes: [], // Tworzenie pustej tablicy ulubionych przepisów
      };

      await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      console.log("Użytkownik zarejestrowany:", email);
      onLogin(username);
    } catch (error) {
      setError("Wystąpił problem z rejestracją.");
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError("Podaj hasło.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users");
      const users = await response.json();

      const user = users.find(
        (user) =>
          (loginMode === "email"
            ? user.email === email
            : user.username === username) && user.password === password
      );

      if (!user) {
        setError("Nieprawidłowy email, nazwa użytkownika lub hasło.");
        return;
      }

      console.log(
        "Zalogowano pomyślnie:",
        loginMode === "email" ? email : username
      );
      localStorage.setItem("userId", user.id); // Store userID in local storage

      onLogin(user.username);
    } catch (error) {
      setError("Wystąpił problem z logowaniem.");
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
