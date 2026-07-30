import { useState, useEffect } from "react";
import AuthScreen from "./AuthScreen";
import StarterQuiz from "./StarterQuiz";
import DungeonGame from "./DungeonGame";
import VillageGame from "./VillageGame";
import { getProfile, getTeam, resetProfile } from "../lib/auth";
import { generateDungeon } from "../lib/dungeon";
import { VILLAGE_SPAWN } from "../lib/village";
import { supabase } from "../lib/supabase";

export default function Dungeon() {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [inDungeon, setInDungeon] = useState(false);

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
    setInDungeon(false);
    localStorage.removeItem("pokevisa_account");
  }

  function handleQuizComplete() {
    loadAccountData(account.id);
  }

  function handleJoin(roomInfo) {
    setSession(roomInfo);
    setInDungeon(false);
  }

  async function handleStartDungeon() {
    if (!session) return;

    if (session.isHost) {
      const seed = Math.floor(Math.random() * 999999);
      const dungeon = generateDungeon(20, 15, seed, 1);

      await supabase.from("dungeon_state").insert({
        room_id: session.roomId,
        ...dungeon,
        floor: 1,
      });

      await supabase
        .from("rooms")
        .update({ status: "playing", dungeon_seed: seed, floor: 1 })
        .eq("id", session.roomId);
    }

    setInDungeon(true);
  }

  async function handleDungeonEnd() {
    if (!session) { setInDungeon(false); return; }

    await supabase
      .from("room_players")
      .update({ position_x: VILLAGE_SPAWN.x, position_y: VILLAGE_SPAWN.y })
      .eq("player_id", session.playerId)
      .eq("room_id", session.roomId);

    await supabase
      .from("rooms")
      .update({ status: "lobby" })
      .eq("id", session.roomId);

    await supabase
      .from("dungeon_state")
      .delete()
      .eq("room_id", session.roomId);

    setInDungeon(false);
    loadAccountData(account.id);
  }

  function handleDungeonTeamUpdate() {
    loadAccountData(account.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <p className="text-sm text-slate-400">...</p>
      </div>
    );
  }

  if (!account) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!profile || !profile.starter_id) {
    return <StarterQuiz accountId={account.id} onComplete={handleQuizComplete} />;
  }

  if (session && inDungeon) {
    return (
      <DungeonGame
        roomId={session.roomId}
        roomCode={session.roomCode}
        playerId={session.playerId}
        isHost={session.isHost}
        accountId={account.id}
        accountName={account.display_name}
        team={team}
        onTeamUpdate={handleDungeonTeamUpdate}
        onLeave={handleDungeonEnd}
      />
    );
  }

  return (
    <VillageGame
      session={session}
      accountId={account.id}
      accountName={account.display_name}
      team={team}
      onTeamUpdate={handleDungeonTeamUpdate}
      onJoin={handleJoin}
      onStartDungeon={handleStartDungeon}
      onLogout={handleLogout}
    />
  );
}
