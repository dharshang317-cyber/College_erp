import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ledger-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="eyebrow">Campus Ledger</p>
          <h1 className="font-display text-3xl text-ledger-accent mt-1">Sign in to your record</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-ledger-panel border border-ledger-line rounded p-8 space-y-5">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ledger-bg border border-ledger-line rounded px-3 py-2.5 text-ledger-text focus:outline-none focus:border-ledger-accent"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ledger-bg border border-ledger-line rounded px-3 py-2.5 text-ledger-text focus:outline-none focus:border-ledger-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-ledger-danger text-sm font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger-accent text-ledger-bg font-medium py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
