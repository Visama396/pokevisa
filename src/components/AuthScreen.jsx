import { useState } from "react";
import { useLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { register, login } from "../lib/auth";
import LanguageSelector from "./LanguageSelector";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const language = useLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const result = await register(username, password, displayName);
        if (result.error) {
          setError(result.error);
        } else {
          onAuth(result.account);
        }
      } else {
        const result = await login(username, password);
        if (result.error) {
          setError(result.error);
        } else {
          onAuth(result.account);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-200">PokéVisa</h1>
        <p className="text-sm text-slate-400 mt-2">Mystery Dungeon</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mode === "login"
                ? "bg-slate-700 text-slate-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("Login", language)}
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mode === "register"
                ? "bg-slate-700 text-slate-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("Register", language)}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">{t("Username", language)}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().slice(0, 16))}
              placeholder={t("Enter username", language)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t("Display Name", language)}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                placeholder={t("How others see you", language)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1">{t("Password", language)}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("Enter password", language)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "login"
              ? t("Login", language)
              : t("Register", language)}
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center">
          {t("No email required. Don't forget your password!", language)}
        </p>
      </div>
    </div>
  );
}
