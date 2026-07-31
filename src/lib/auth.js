import { supabase } from "./supabase";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "pokevisa_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function register(username, password, displayName) {
  const cleanName = username.trim().toLowerCase();
  if (cleanName.length < 3 || cleanName.length > 16) {
    return { error: "Username must be 3-16 characters" };
  }
  if (password.length < 4) {
    return { error: "Password must be at least 4 characters" };
  }
  if (!/^[a-z0-9_]+$/.test(cleanName)) {
    return { error: "Username can only contain lowercase letters, numbers, and underscores" };
  }

  const { data: existing } = await supabase
    .from("accounts")
    .select("id")
    .eq("username", cleanName)
    .maybeSingle();

  if (existing) {
    return { error: "Username already taken" };
  }

  const passwordHash = await hashPassword(password);
  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      username: cleanName,
      password_hash: passwordHash,
      display_name: displayName?.trim() || cleanName,
    })
    .select("id, username, display_name")
    .single();

  if (error) return { error: error.message };

  return { account };
}

export async function login(username, password) {
  const cleanName = username.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const { data: account, error } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .eq("username", cleanName)
    .eq("password_hash", passwordHash)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!account) return { error: "Invalid username or password" };

  return { account };
}

export async function getProfile(accountId) {
  const { data } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("account_id", accountId)
    .maybeSingle();
  return data;
}

export async function saveProfile(accountId, updates) {
  const { error } = await supabase
    .from("player_profiles")
    .upsert({ account_id: accountId, ...updates });
  return error;
}

export async function resetProfile(accountId) {
  const { error } = await supabase
    .from("player_profiles")
    .delete()
    .eq("account_id", accountId);
  return error;
}

export async function getTeam(accountId) {
  const { data } = await supabase
    .from("player_team")
    .select("*")
    .eq("account_id", accountId)
    .order("slot");
  return data || [];
}

export async function addTeamMember(accountId, member) {
  const { error } = await supabase
    .from("player_team")
    .insert({ account_id: accountId, ...member });
  return error;
}

export async function updateTeamMember(id, updates) {
  const { error } = await supabase
    .from("player_team")
    .update(updates)
    .eq("id", id);
  return error;
}

export async function removeTeamMember(id) {
  const { error } = await supabase
    .from("player_team")
    .delete()
    .eq("id", id);
  return error;
}

export async function getSavedDungeon(accountId) {
  const { data } = await supabase
    .from("saved_dungeons")
    .select("*")
    .eq("account_id", accountId)
    .maybeSingle();
  return data;
}

export async function saveDungeonProgress(accountId, dungeonData) {
  const { error } = await supabase
    .from("saved_dungeons")
    .upsert({ account_id: accountId, ...dungeonData });
  return error;
}

export async function changePassword(accountId, currentPassword, newPassword) {
  const currentHash = await hashPassword(currentPassword);
  const newHash = await hashPassword(newPassword);

  const { data, error } = await supabase.rpc("change_password", {
    p_account_id: accountId,
    p_current_password_hash: currentHash,
    p_new_password_hash: newHash,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Current password is incorrect" };

  return { success: true };
}

export async function deleteSavedDungeon(accountId) {
  const { error } = await supabase
    .from("saved_dungeons")
    .delete()
    .eq("account_id", accountId);
  return error;
}

// ─── Friends (social system) ───
// Rows live in the `friends` table: account_id = requester, friend_id =
// recipient. A request is 'pending'; once accepted the row is a friendship.
// Used by the village friends panel and the "join a friend's dungeon" flow.

// All accepted friends of accountId, as account records (id, username, display_name).
export async function getFriends(accountId) {
  const [{ data: outgoing }, { data: incoming }] = await Promise.all([
    supabase.from("friends").select("friend_id").eq("account_id", accountId).eq("status", "accepted"),
    supabase.from("friends").select("account_id").eq("friend_id", accountId).eq("status", "accepted"),
  ]);
  const ids = [...new Set([
    ...(outgoing || []).map((r) => r.friend_id),
    ...(incoming || []).map((r) => r.account_id),
  ])];
  if (ids.length === 0) return [];
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .in("id", ids);
  return accounts || [];
}

// Pending requests someone sent TO accountId (with sender info).
export async function getIncomingFriendRequests(accountId) {
  const { data } = await supabase
    .from("friends")
    .select("account_id, created_at")
    .eq("friend_id", accountId)
    .eq("status", "pending");
  const ids = (data || []).map((r) => r.account_id);
  if (ids.length === 0) return [];
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .in("id", ids);
  return (accounts || []).map((a) => ({
    ...a,
    created_at: data.find((r) => r.account_id === a.id)?.created_at,
  }));
}

// Pending requests accountId sent to others.
export async function getOutgoingFriendRequests(accountId) {
  const { data } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("account_id", accountId)
    .eq("status", "pending");
  const ids = (data || []).map((r) => r.friend_id);
  if (ids.length === 0) return [];
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .in("id", ids);
  return accounts || [];
}

// Send a friend request (idempotent; no duplicates or self-requests).
export async function sendFriendRequest(fromId, toId) {
  if (fromId === toId) return { error: "You can't add yourself" };
  const { data: existing } = await supabase
    .from("friends")
    .select("id")
    .or(`and(account_id.eq.${fromId},friend_id.eq.${toId}),and(account_id.eq.${toId},friend_id.eq.${fromId})`);
  if (existing && existing.length > 0) {
    return { error: "Already friends or request pending" };
  }
  const { error } = await supabase
    .from("friends")
    .insert({ account_id: fromId, friend_id: toId, status: "pending" });
  return error ? { error: error.message } : {};
}

// Accept (status -> accepted) or decline (delete) a pending request.
export async function respondToFriendRequest(requesterId, recipientId, accept) {
  if (accept) {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("account_id", requesterId)
      .eq("friend_id", recipientId);
    return error ? { error: error.message } : {};
  }
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("account_id", requesterId)
    .eq("friend_id", recipientId);
  return error ? { error: error.message } : {};
}

// Remove a friendship in either direction.
export async function removeFriend(a, b) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .or(`and(account_id.eq.${a},friend_id.eq.${b}),and(account_id.eq.${b},friend_id.eq.${a})`);
  return error ? { error: error.message } : {};
}

// Search accounts by display_name or username.
export async function searchAccounts(query) {
  const clean = query.trim();
  if (clean.length < 2) return [];
  const { data } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .or(`username.ilike.%${clean.toLowerCase()}%,display_name.ilike.%${clean}%`)
    .limit(20);
  return data || [];
}

// Accepted friends that are currently inside a playing dungeon, grouped by room.
// Each result: { roomId, code, floor, friends: [{ id, display_name }] }.
export async function getFriendsInDungeons(accountId) {
  const friends = await getFriends(accountId);
  if (friends.length === 0) return [];
  const ids = friends.map((f) => f.id);
  const { data: roomPlayers } = await supabase
    .from("room_players")
    .select("player_id, player_name, room_id, rooms(code, status, floor)")
    .in("player_id", ids);
  const byRoom = {};
  for (const rp of roomPlayers || []) {
    const room = rp.rooms;
    if (!room || room.status !== "playing") continue;
    const friend = friends.find((f) => f.id === rp.player_id);
    if (!byRoom[rp.room_id]) {
      byRoom[rp.room_id] = { roomId: rp.room_id, code: room.code, floor: room.floor, friends: [] };
    }
    byRoom[rp.room_id].friends.push({
      id: friend.id,
      display_name: friend.display_name,
      player_name: rp.player_name,
    });
  }
  return Object.values(byRoom);
}

// Accepted friends who are currently standing in a village (a lobby room).
// Returns a map: { friendId: { roomId, code } } so the friends panel can offer
// "join their village" without guessing a room code.
export async function getFriendVillages(accountId) {
  const friends = await getFriends(accountId);
  if (friends.length === 0) return {};
  const ids = friends.map((f) => f.id);
  const { data: roomPlayers } = await supabase
    .from("room_players")
    .select("player_id, room_id, rooms(code, status)")
    .in("player_id", ids);
  const byFriend = {};
  for (const rp of roomPlayers || []) {
    const room = rp.rooms;
    if (!room || room.status !== "lobby") continue;
    byFriend[rp.player_id] = { roomId: rp.room_id, code: room.code };
  }
  return byFriend;
}

// Add one item to a friend's inventory (used by Kangaskhan Storage sending).
// RLS on player_profiles is open, so a player may deposit an item into a friend's
// inventory. Returns { error } on failure.
export async function giveItemToFriend(friendId, itemId) {
  const { data: prof } = await supabase
    .from("player_profiles")
    .select("inventory")
    .eq("account_id", friendId)
    .maybeSingle();
  if (!prof) return { error: "Friend doesn't have a profile yet" };
  const inv = normalizeInventory(prof.inventory);
  const { error } = await supabase
    .from("player_profiles")
    .update({ inventory: { ...inv, items: [...inv.items, itemId] } })
    .eq("account_id", friendId);
  return error ? { error: error.message } : {};
}

// Make sure an inventory object always carries the four keys the app relies on
// (pocket gold, banked gold, carried items, stored items). Old profiles and
// partially-built objects may be missing some of them.
export function normalizeInventory(inv) {
  return {
    gold: inv?.gold || 0,
    banked_gold: inv?.banked_gold || 0,
    items: inv?.items || [],
    storage: inv?.storage || [],
  };
}
