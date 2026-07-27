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

export async function deleteSavedDungeon(accountId) {
  const { error } = await supabase
    .from("saved_dungeons")
    .delete()
    .eq("account_id", accountId);
  return error;
}
