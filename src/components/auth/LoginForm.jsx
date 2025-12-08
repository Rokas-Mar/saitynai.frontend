import { useState } from "react";
import api from "../../api/client.js"; // 👈 remove setAuthToken import
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com"); // use seeded admin
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, role, name } = res.data;

      if (remember) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", role);
        localStorage.setItem("userName", name);
      }

      login(accessToken, role, name);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Neteisingi prisijungimo duomenys.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h1>Prisijungimas</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          El. paštas
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Slaptažodis
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="remember-row">
          Atsiminti mane
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button
          type="submit"
          className={
            "btn btn-primary btn-full" + (isLoading ? " isloading" : "")
          }
          disabled={isLoading}
        >
          Prisijungti
        </button>
      </form>
    </div>
  );
}
