// src/pages/Login.jsx
import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { ensureCsrfCookie } from "../axiosConfig";

/* ---------- regex ---------- */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function Login() {
  /* ------- state ------- */
  const [mode, setMode] = useState("login"); // login | register
  const [loginBy, setLoginBy] = useState("email"); // email | username
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const nav = useNavigate();

  /* ------- submit ------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!emailOk(email)) return setError("Podaj prawidłowy e-mail.");
      try {
        await ensureCsrfCookie();
        const ok = await register(username, email, password);
        if (ok) nav("/verify");
        alert(
          "Rejestracja zakończona sukcesem. Sprawdź swoją skrzynkę e-mail, aby aktywować konto."
        );
      } catch (err) {
        const msg = err.response?.data
          ? Object.values(err.response.data).flat().join(" ")
          : "Błąd rejestracji.";
        setError(msg);
      }
    } else {
      if (!password) return setError("Podaj hasło.");
      try {
        await ensureCsrfCookie();
        const identifier = loginBy === "email" ? email : username;
        await login(identifier, password);
        nav("/");
      } catch {
        setError("Nieprawidłowe dane logowania.");
      }
    }
  };

  /* ------- render ------- */
  return (
    <Page>
      <Card>
        {/* --- zakładki główne --- */}
        <Tabs>
          {["login", "register"].map((m) => (
            <Tab key={m} aria-selected={mode === m} onClick={() => setMode(m)}>
              {m === "login" ? "Login" : "Rejestracja"}
            </Tab>
          ))}
        </Tabs>

        {/* --- formularz --- */}
        <Form onSubmit={handleSubmit}>
          {mode === "login" && (
            <LoginSwitch>
              {["email", "username"].map((l) => (
                <SmallTab
                  key={l}
                  aria-selected={loginBy === l}
                  onClick={() => setLoginBy(l)}
                >
                  {l === "email" ? "E-mail" : "Login"}
                </SmallTab>
              ))}
            </LoginSwitch>
          )}

          {/* --- pola wejściowe --- */}
          {mode === "register" ? (
            <>
              <Input
                type="text"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          ) : loginBy === "email" ? (
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <Input
              type="text"
              placeholder="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <Input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <Error>{error}</Error>}

          <Btn type="submit">
            {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
          </Btn>
        </Form>

        <OAuth
          onClick={() =>
            (window.location.href = "http://localhost:8000/auth/github-direct/")
          }
        >
          <FaGithub size={18} style={{ marginRight: ".5rem" }} />
          Zaloguj przez GitHub
        </OAuth>
      </Card>
    </Page>
  );
}

export default Login;

/* ───────── styled-components ───────── */

const Page = styled.div`
  min-height: 100dvh;
  display: grid;
  align-items: center;
  padding: 10rem;
  padding-left: 37vw;
`;

const Card = styled.div`
  width: min(95vw, 330px);
  background: #ebe6e6;
  border: 1px solid #5b422c;
  border-radius: 8px;
  padding: 1rem 2rem 2rem;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  visibility: visible;
`;

const Tabs = styled.div`
  display: flex;
  margin: -1rem -2rem 1.5rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.7rem 0;
  border: 1px solid #5b422c;
  background: ${({ "aria-selected": a }) => (a ? "#5b422c" : "#ddd")};
  color: ${({ "aria-selected": a }) => (a ? "#fff" : "#5b422c")};
  font-weight: 600;
  cursor: pointer;
  &:first-child {
    border-right: none;
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const LoginSwitch = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const SmallTab = styled.button`
  flex: 1;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  border: 1px solid #5b422c;
  background: ${({ "aria-selected": a }) => (a ? "#5b422c" : "#ddd")};
  color: ${({ "aria-selected": a }) => (a ? "#fff" : "#5b422c")};
  cursor: pointer;
  &:first-child {
    border-right: none;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }
  &:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Btn = styled.button`
  padding: 1rem;
  background: #5b422c;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const OAuth = styled(Btn)`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #333;
`;

const Error = styled.p`
  color: #d22;
  font-size: 0.9rem;
  margin: 0;
`;
