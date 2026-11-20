import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Factory, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/app");
    } catch {
      setError("Username ya password galat hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-side">
        <div className="brand light"><Factory size={26} /> OrderCraft</div>
        <h2>Manage your manufacturing orders with confidence.</h2>
        <p>Sales, BOM, purchasing, invoicing and payments in one platform.</p>
      </div>

      <div className="login-form-wrap">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to continue</p>

          <label>Username
            <div className="input-icon">
              <User size={16} />
              <input value={form.username} required
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </label>

          <label>Password
            <div className="input-icon">
              <Lock size={16} />
              <input type="password" value={form.password} required
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </label>

          {error && <div className="error">{error}</div>}
          <button className="btn full" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
          <Link to="/" className="back">Back to home</Link>
        </form>
      </div>
    </div>
  );
}