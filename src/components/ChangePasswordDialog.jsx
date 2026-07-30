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
      setError("New password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
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
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4 text-center">
          <p className="text-green-400 font-semibold">Password changed successfully</p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 rounded-xl bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
