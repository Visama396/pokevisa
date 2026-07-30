import { useState, useEffect, useCallback } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
import { supabase } from "../lib/supabase";
import LanguageSelector from "./LanguageSelector";
import TeamView from "./TeamView";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { getSpeciesName } from "../lib/moves";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function DungeonLobby({ accountId, accountName, team, onTeamUpdate, onJoin, onLogout }) {
  const [language, setLanguage] = useState(getLanguage());
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const playerId = accountId;

  useEffect(() => subscribe(setLanguage), []);

  const starterSprite = team.length > 0 ? team[0].pokemon_id : 25;
  const starterHp = team.length > 0 ? team[0].hp : 100;
  const starterMaxHp = team.length > 0 ? team[0].max_hp : 100;

  const createRoom = useCallback(async () => {
    setIsCreating(true);
    setError("");

    try {
      const dungeonSeed = Math.floor(Math.random() * 2147483647);
      const code = generateRoomCode();

      try { supabase.rpc("cleanup_old_rooms"); } catch (_) {}

      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .insert({
          code,
          host_id: playerId,
          max_players: 4,
          status: "playing",
          dungeon_seed: dungeonSeed,
        })
        .select()
        .single();

      if (roomErr) throw roomErr;

      const { error: joinErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        player_id: playerId,
        player_name: accountName,
        sprite_id: starterSprite,
        is_host: true,
        hp: starterHp,
        max_hp: starterMaxHp,
        position_x: 1,
        position_y: 1,
      });

      if (joinErr) throw joinErr;

      onJoin({ roomId: room.id, roomCode: code, playerId, isHost: true });
    } catch (err) {
      console.error("Create room error:", err);
      setError(err.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  }, [playerId, accountName, starterSprite, onJoin, language]);

  const joinRoom = useCallback(async () => {
    if (!roomCode.trim()) {
      setError(t("Enter room code", language));
      return;
    }
    setIsJoining(true);
    setError("");

    try {
      try { supabase.rpc("cleanup_old_rooms"); } catch (_) {}

      const { data: room, error: findErr } = await supabase
        .from("rooms")
        .select("*")
        .ilike("code", roomCode.trim().toUpperCase())
        .single();

      if (findErr || !room) {
        setError(t("Room not found", language));
        setIsJoining(false);
        return;
      }

      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id);

      if (count >= room.max_players) {
        setError(t("Room is full", language));
        setIsJoining(false);
        return;
      }

      const { data: existing } = await supabase
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("player_id", playerId)
        .maybeSingle();

      if (existing) {
        onJoin({ roomId: room.id, roomCode: room.code, playerId, isHost: room.host_id === playerId });
        return;
      }

      const { error: joinErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        player_id: playerId,
        player_name: accountName,
        sprite_id: starterSprite,
        hp: starterHp,
        max_hp: starterMaxHp,
        is_host: false,
      });

      if (joinErr) throw joinErr;

      onJoin({ roomId: room.id, roomCode: room.code, playerId, isHost: false });
    } catch (err) {
      console.error("Join room error:", err);
      setError(err.message || "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  }, [roomCode, playerId, accountName, starterSprite, onJoin, language]);

  const invadeRoom = useCallback(async () => {
    setIsJoining(true);
    setError("");

    try {
      try { supabase.rpc("cleanup_old_rooms"); } catch (_) {}

      const { data: openRooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "playing")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!openRooms || openRooms.length === 0) {
        setError(t("No rooms available. Create one instead!", language));
        setIsJoining(false);
        return;
      }

      const room = openRooms[Math.floor(Math.random() * openRooms.length)];

      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id);

      if (count >= room.max_players) {
        setError(t("Room is full", language));
        setIsJoining(false);
        return;
      }

      const { data: existing } = await supabase
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("player_id", playerId)
        .maybeSingle();

      if (existing) {
        onJoin({ roomId: room.id, roomCode: room.code, playerId, isHost: room.host_id === playerId });
        return;
      }

      const { error: joinErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        player_id: playerId,
        player_name: accountName,
        sprite_id: starterSprite,
        hp: starterHp,
        max_hp: starterMaxHp,
        is_host: false,
        position_x: 1,
        position_y: 1,
      });

      if (joinErr) throw joinErr;

      onJoin({ roomId: room.id, roomCode: room.code, playerId, isHost: false });
    } catch (err) {
      console.error("Invade room error:", err);
      setError(err.message || "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  }, [playerId, accountName, starterSprite, onJoin, language]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t("Home", language)}
        </a>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={() => setShowChangePassword(true)}
            className="text-xs text-slate-400 hover:text-yellow-400 transition-colors"
          >
            {t("Change Password", language)}
          </button>
          <button
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            {t("Logout", language)}
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("Dungeon Crawler", language)}</h1>
        <p className="text-sm text-slate-400">{t("dungeon-desc", language)}</p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 flex items-center gap-4">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starterSprite}.png`}
          alt=""
          className="w-12 h-12"
        />
        <div>
          <p className="font-semibold text-slate-200">{accountName}</p>
          <p className="text-xs text-slate-400">
            {team.length} {t("Pokémon", language)} in team
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase">{t("Your Team", language)}</h2>
        <TeamView team={team} onUpdate={onTeamUpdate} />
      </div>

      {/* Game Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Play */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">{t("Play", language)}</h2>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{t("Start a dungeon run", language)}</p>
            <button
              onClick={createRoom}
              disabled={isCreating || team.length === 0}
              className="w-full rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isCreating ? t("Starting...", language) : t("Start Game", language)}
            </button>
          </div>
          <hr className="border-slate-700" />
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{t("Invade a random dungeon", language)}</p>
            <button
              onClick={invadeRoom}
              disabled={isJoining || team.length === 0}
              className="w-full rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isJoining ? t("Invading...", language) : t("Invade", language)}
            </button>
          </div>
        </div>

        {/* Join Room (Co-op) */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">{t("Join Room", language)}</h2>
          <p className="text-sm text-slate-400">{t("Join a room to play cooperatively", language)}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder={t("Enter room code", language)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500 font-mono text-center tracking-widest uppercase"
            />
            <button
              onClick={joinRoom}
              disabled={isJoining || team.length === 0}
              className="w-full sm:w-auto rounded-xl bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isJoining ? t("Joining...", language) : t("Join", language)}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center text-sm text-red-400 bg-red-900/20 rounded-xl py-2 px-4">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-3 text-sm text-slate-300">
        <h3 className="font-semibold text-slate-200">{t("How to play", language)}</h3>
        <p>🏰 {t("dungeon-rule1", language)}</p>
        <p>⚔️ {t("dungeon-rule2", language)}</p>
        <p>🤝 {t("dungeon-rule3", language)}</p>
        <p>💀 {t("dungeon-rule4", language)}</p>
      </div>

      {showChangePassword && (
        <ChangePasswordDialog
          accountId={accountId}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}
