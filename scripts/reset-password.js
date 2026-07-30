import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Usage: PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/reset-password.js <username> <new-password>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "pokevisa_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const username = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error("Usage: PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/reset-password.js <username> <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 4) {
    console.error("Password must be at least 4 characters");
    process.exit(1);
  }

  const { data: account, error: lookupError } = await supabase
    .from("accounts")
    .select("id, username, display_name")
    .eq("username", username)
    .maybeSingle();

  if (lookupError) {
    console.error("Database error:", lookupError.message);
    process.exit(1);
  }

  if (!account) {
    console.error(`Account "${username}" not found`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(newPassword);

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ password_hash: passwordHash })
    .eq("id", account.id);

  if (updateError) {
    console.error("Failed to update password:", updateError.message);
    process.exit(1);
  }

  console.log(`Password reset for ${account.display_name} (${account.username})`);
  console.log(`Temporary password: ${newPassword}`);
  console.log("Tell the player to change it after logging in.");
}

main().catch(console.error);
