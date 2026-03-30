import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }

      if (!data?.token || data?.role !== "admin" && data?.role !== "superAdmin") {
        throw new Error("This account is not an admin account");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-canvas-alt px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-main">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">Sign in with your admin account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none"
            required
          />
          {error && (
            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
