import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_CREDENTIALS } from "../../services/auth";
import { IconLock } from "../../components/Icons/Icons";
import styles from "../admin.module.css";

interface LocationState {
  from?: { pathname: string };
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      setError("Those credentials don't match our records. Try again.");
      return;
    }
    const dest = (location.state as LocationState | null)?.from?.pathname ?? "/admin";
    navigate(dest, { replace: true });
  }

  return (
    <div className={styles.loginWrap}>
      <section className={styles.loginHero}>
        <div className={styles.loginBrand}>
          Dabi<span> Admin</span>
        </div>
        <div>
          <h1>Run your hostel network from one place.</h1>
          <p>
            Listings, owners, enquiries and promotions — everything the Dabi team
            needs to keep students housed.
          </p>
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          Secure admin area
        </div>
      </section>

      <section className={styles.loginPanel}>
        <div className={styles.loginCard}>
          <div className={styles.welcomeMsg}>
              <span className={styles.welcomeWave}>👋 Welcome</span>
            <span className={styles.welcomeSub}>to the Dabi admin console</span>
          </div>
          <h2>Sign in to continue</h2>
          <p>Sign in with your administrator account.</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="admin@dabi.com"
                autoComplete="username"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button
              type="submit"
              className={`dabi-btn dabi-btn-primary ${styles.btnSm} ${styles.btnBlock}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  <IconLock size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className={styles.credHint}>
              Demo login — <code>{ADMIN_CREDENTIALS.email}</code> /{" "}
              <code>{ADMIN_CREDENTIALS.password}</code>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
