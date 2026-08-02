import { useState } from "react";
import { getLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { changePassword } from "../lib/auth";

export default function ChangePasswordDialog({ accountId, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const language = getLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 4) {
      setError(t("New password must be at least 4 characters", language));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("Passwords don't match", language));
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(accountId, currentPassword, newPassword);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || t("Something went wrong", language));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4 text-center">
          <p className="text-green-400 font-semibold">{t("Password changed successfully", language)}</p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors"
          >
            {t("Done", language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">{t("Change Password", language)}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">{t("Current Password", language)}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">{t("New Password", language)}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">{t("Confirm New Password", language)}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {t("Cancel", language)}
            </button>
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 rounded-xl bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? t("Saving...", language) : t("Save", language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
