import { useState, useEffect } from "react";
import AuthScreen from "./AuthScreen";
import StarterQuiz from "./StarterQuiz";
import DungeonLobby from "./DungeonLobby";
import DungeonGame from "./DungeonGame";
import { getProfile, getTeam, resetProfile } from "../lib/auth";

export default function Dungeon() {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pokevisa_account");
      if (saved) {
        const acc = JSON.parse(saved);
        setAccount(acc);
        loadAccountData(acc.id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  async function loadAccountData(accountId) {
    setLoading(true);
    try {
      const [prof, tm] = await Promise.all([getProfile(accountId), getTeam(accountId)]);
      if (tm.length === 0 && prof) {
        await resetProfile(accountId);
        setProfile(null);
      } else {
        setProfile(prof);
      }
      setTeam(tm);
    } catch (err) {
      console.error("Failed to load account data:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(acc) {
    setAccount(acc);
    localStorage.setItem("pokevisa_account", JSON.stringify(acc));
    loadAccountData(acc.id);
  }

  function handleLogout() {
    setAccount(null);
    setProfile(null);
    setTeam([]);
    setSession(null);
    localStorage.removeItem("pokevisa_account");
  }

  function handleQuizComplete() {
    loadAccountData(account.id);
  }

  function handleTeamUpdate() {
    loadAccountData(account.id);
  }

  function handleSessionEnd() {
    setSession(null);
    loadAccountData(account.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <p className="text-sm text-slate-400">...</p>
      </div>
    );
  }

  // Not logged in
  if (!account) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  // Logged in but hasn't done the quiz
  if (!profile || !profile.starter_id) {
    return <StarterQuiz accountId={account.id} onComplete={handleQuizComplete} />;
  }

  // In a game session
  if (session) {
    return (
      <DungeonGame
        roomId={session.roomId}
        roomCode={session.roomCode}
        playerId={session.playerId}
        isHost={session.isHost}
        accountId={account.id}
        accountName={account.display_name}
        team={team}
        onTeamUpdate={handleTeamUpdate}
        onLeave={handleSessionEnd}
      />
    );
  }

  // Main lobby
  return (
    <DungeonLobby
      accountId={account.id}
      accountName={account.display_name}
      team={team}
      onTeamUpdate={handleTeamUpdate}
      onJoin={setSession}
      onLogout={handleLogout}
    />
  );
}
