-- ═══════════════════════════════════════════════════════
-- PAHLAWAN TERAKHIR — Safe SQL Setup
-- Selamat untuk run berulang kali
-- ═══════════════════════════════════════════════════════

-- 1. CREATE TABLES
CREATE TABLE IF NOT EXISTS kn_usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_name TEXT UNIQUE NOT NULL,
  faction TEXT NOT NULL DEFAULT 'elmorad',
  race TEXT NOT NULL DEFAULT 'human',
  job TEXT NOT NULL DEFAULT 'warrior',
  face_idx INT DEFAULT 0,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  gold INT DEFAULT 3000,
  best_wave INT DEFAULT 0,
  best_score INT DEFAULT 0,
  skill_pts INT DEFAULT 0,
  stat_pts INT DEFAULT 0,
  banned BOOLEAN DEFAULT false,
  current_zone TEXT DEFAULT 'moradon',
  stat_str INT DEFAULT 70,
  stat_hp INT DEFAULT 70,
  stat_dex INT DEFAULT 65,
  stat_int INT DEFAULT 55,
  stat_mp INT DEFAULT 55,
  inventory JSONB DEFAULT '{}',
  equipment JSONB DEFAULT '{}',
  skill_tree JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_name TEXT,
  faction TEXT,
  score INT DEFAULT 0,
  wave INT DEFAULT 1,
  level INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_gm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  gm_name TEXT NOT NULL,
  role TEXT DEFAULT 'gm',
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name TEXT NOT NULL,
  reason TEXT,
  banned_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_broadcast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  sent_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS kn_gm_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gm_name TEXT,
  action TEXT,
  target TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADD COLUMNS jika belum ada
ALTER TABLE kn_players ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE kn_players ADD COLUMN IF NOT EXISTS stat_pts INT DEFAULT 0;

-- 3. ENABLE RLS
ALTER TABLE kn_usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_gm ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_broadcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_gm_log ENABLE ROW LEVEL SECURITY;

-- 4. DROP POLICY LAMA
DROP POLICY IF EXISTS "Anyone can check username" ON kn_usernames;
DROP POLICY IF EXISTS "Owner can insert username" ON kn_usernames;
DROP POLICY IF EXISTS "Owner can delete username" ON kn_usernames;
DROP POLICY IF EXISTS "Anyone can read players" ON kn_players;
DROP POLICY IF EXISTS "Owner can insert player" ON kn_players;
DROP POLICY IF EXISTS "Owner can update player" ON kn_players;
DROP POLICY IF EXISTS "Owner can delete player" ON kn_players;
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON kn_leaderboard;
DROP POLICY IF EXISTS "Owner can insert score" ON kn_leaderboard;
DROP POLICY IF EXISTS "GM can read own record" ON kn_gm;
DROP POLICY IF EXISTS "No public insert to kn_gm" ON kn_gm;
DROP POLICY IF EXISTS "Anyone can read bans" ON kn_bans;
DROP POLICY IF EXISTS "Auth users can insert ban" ON kn_bans;
DROP POLICY IF EXISTS "Auth users can delete ban" ON kn_bans;
DROP POLICY IF EXISTS "Anyone can read broadcast" ON kn_broadcast;
DROP POLICY IF EXISTS "Auth can insert broadcast" ON kn_broadcast;
DROP POLICY IF EXISTS "Auth can read gm_log" ON kn_gm_log;
DROP POLICY IF EXISTS "Auth can insert gm_log" ON kn_gm_log;

-- 5. CIPTA POLICY BARU
CREATE POLICY "Anyone can check username" ON kn_usernames FOR SELECT USING (true);
CREATE POLICY "Owner can insert username" ON kn_usernames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete username" ON kn_usernames FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read players" ON kn_players FOR SELECT USING (true);
CREATE POLICY "Owner can insert player" ON kn_players FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY "Owner can update player" ON kn_players FOR UPDATE USING (auth.uid() = account_id);
CREATE POLICY "Owner can delete player" ON kn_players FOR DELETE USING (auth.uid() = account_id);
CREATE POLICY "Anyone can read leaderboard" ON kn_leaderboard FOR SELECT USING (true);
CREATE POLICY "Owner can insert score" ON kn_leaderboard FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY "GM can read own record" ON kn_gm FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No public insert to kn_gm" ON kn_gm FOR INSERT WITH CHECK (false);
CREATE POLICY "Anyone can read bans" ON kn_bans FOR SELECT USING (true);
CREATE POLICY "Auth users can insert ban" ON kn_bans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete ban" ON kn_bans FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can read broadcast" ON kn_broadcast FOR SELECT USING (true);
CREATE POLICY "Auth can insert broadcast" ON kn_broadcast FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can read gm_log" ON kn_gm_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can insert gm_log" ON kn_gm_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. INDEX
CREATE INDEX IF NOT EXISTS idx_players_account ON kn_players(account_id);
CREATE INDEX IF NOT EXISTS idx_players_charname ON kn_players(char_name);
CREATE INDEX IF NOT EXISTS idx_lb_score ON kn_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_usernames_name ON kn_usernames(username);
CREATE INDEX IF NOT EXISTS idx_bans_charname ON kn_bans(char_name);
CREATE INDEX IF NOT EXISTS idx_gmlog_created ON kn_gm_log(created_at DESC);

-- SELESAI
SELECT 'Setup berjaya!' AS status;

-- ═══════════════════════════════════════════════════════
-- POWER-UP STORE TABLES
-- ═══════════════════════════════════════════════════════

-- Top-up requests (manual bayar)
CREATE TABLE IF NOT EXISTS kn_topup_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name   TEXT,
  account_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  amount_rm   NUMERIC(10,2),
  ref_no      TEXT,
  phone       TEXT,
  points_req  INT DEFAULT 0,
  pkg_id      TEXT,
  status      TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Top-up codes (GM cipta, player guna)
CREATE TABLE IF NOT EXISTS kn_topup_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  points     INT NOT NULL DEFAULT 0,
  used       BOOLEAN DEFAULT false,
  used_by    TEXT,
  used_at    TIMESTAMPTZ,
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point transaction log
CREATE TABLE IF NOT EXISTS kn_point_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name   TEXT,
  account_id  UUID,
  type        TEXT,  -- topup_code, topup_manual, purchase, gm_grant
  points      INT DEFAULT 0,
  description TEXT,
  balance     INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE kn_topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_topup_codes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_point_log      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can read topup requests"  ON kn_topup_requests;
DROP POLICY IF EXISTS "Owner can insert topup request" ON kn_topup_requests;
DROP POLICY IF EXISTS "Anyone can check topup code"    ON kn_topup_codes;
DROP POLICY IF EXISTS "Auth can use topup code"        ON kn_topup_codes;
DROP POLICY IF EXISTS "Owner can read point log"       ON kn_point_log;
DROP POLICY IF EXISTS "Auth can insert point log"      ON kn_point_log;

CREATE POLICY "Owner can read topup requests"  ON kn_topup_requests FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY "Owner can insert topup request" ON kn_topup_requests FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY "Anyone can check topup code"    ON kn_topup_codes FOR SELECT USING (true);
CREATE POLICY "Auth can use topup code"        ON kn_topup_codes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Owner can read point log"       ON kn_point_log FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY "Auth can insert point log"      ON kn_point_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_topup_status    ON kn_topup_requests(status);
CREATE INDEX IF NOT EXISTS idx_topup_codes     ON kn_topup_codes(code);
CREATE INDEX IF NOT EXISTS idx_point_log_char  ON kn_point_log(char_name);

-- ═══════════════════════════════════════════════════════
-- DAFTAR GM: PelituN03
-- ═══════════════════════════════════════════════════════
-- Jalankan SQL ini SELEPAS daftar akaun PelituN03 dalam game
--
-- LANGKAH:
-- 1. Daftar akaun "PelituN03" dalam game (jika belum ada)
-- 2. Pergi Supabase Dashboard → Authentication → Users
-- 3. Cari email: pelitun03@pahlawan-terakhir.game
-- 4. Copy UUID (contoh: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
-- 5. Ganti UUID_PELITUN03 di bawah dengan UUID tersebut
-- 6. Jalankan SQL ini

INSERT INTO kn_gm (user_id, gm_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'pelitun03@pahlawan-terakhir.game' LIMIT 1),
  'PelituN03',
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET gm_name = 'PelituN03', role = 'admin';

-- Sahkan GM berjaya didaftarkan:
SELECT gm_name, role, created_at FROM kn_gm WHERE gm_name = 'PelituN03';

-- ═══════════════════════════════════════════════════════
-- PvP, Market, Guild, Quest, Siege Tables
-- ═══════════════════════════════════════════════════════

-- Market / Trade Board
CREATE TABLE IF NOT EXISTS kn_market (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name TEXT NOT NULL,
  account_id  UUID,
  item_id     TEXT NOT NULL,
  item_name   TEXT,
  item_type   TEXT,
  item_icon   TEXT,
  item_rarity TEXT DEFAULT 'common',
  enh         INT  DEFAULT 0,
  qty         INT  DEFAULT 1,
  price       INT  NOT NULL,
  status      TEXT DEFAULT 'active', -- active,sold,cancelled
  buyer_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Guilds
CREATE TABLE IF NOT EXISTS kn_guilds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT UNIQUE NOT NULL,
  motto        TEXT DEFAULT '',
  emblem       TEXT DEFAULT '🏰',
  faction      TEXT DEFAULT 'elmorad',
  leader_name  TEXT,
  level        INT  DEFAULT 1,
  exp          INT  DEFAULT 0,
  member_count INT  DEFAULT 1,
  max_members  INT  DEFAULT 20,
  is_public    BOOLEAN DEFAULT true,
  invite_code  TEXT UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Guild Members
CREATE TABLE IF NOT EXISTS kn_guild_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id   UUID REFERENCES kn_guilds(id) ON DELETE CASCADE,
  char_name  TEXT NOT NULL,
  account_id UUID,
  rank       TEXT DEFAULT 'member', -- leader, officer, member
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(char_name)
);

-- Guild Join Requests
CREATE TABLE IF NOT EXISTS kn_guild_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id   UUID REFERENCES kn_guilds(id) ON DELETE CASCADE,
  char_name  TEXT NOT NULL,
  account_id UUID,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function: tambah gold ke player (untuk market seller)
CREATE OR REPLACE FUNCTION add_gold_to_player(p_char_name TEXT, p_gold INT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE kn_players
  SET gold = gold + p_gold
  WHERE char_name = p_char_name;
END;
$$;

-- RLS
ALTER TABLE kn_market        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guilds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guild_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read market"     ON kn_market;
DROP POLICY IF EXISTS "Auth can insert market"     ON kn_market;
DROP POLICY IF EXISTS "Owner can update market"    ON kn_market;
DROP POLICY IF EXISTS "Anyone can read guilds"     ON kn_guilds;
DROP POLICY IF EXISTS "Auth can create guild"      ON kn_guilds;
DROP POLICY IF EXISTS "Auth can update guild"      ON kn_guilds;
DROP POLICY IF EXISTS "Anyone can read members"    ON kn_guild_members;
DROP POLICY IF EXISTS "Auth can manage members"    ON kn_guild_members;
DROP POLICY IF EXISTS "Auth can read requests"     ON kn_guild_requests;
DROP POLICY IF EXISTS "Auth can insert request"    ON kn_guild_requests;

CREATE POLICY "Anyone can read market"     ON kn_market FOR SELECT USING (true);
CREATE POLICY "Auth can insert market"     ON kn_market FOR INSERT WITH CHECK (auth.role()='authenticated');
CREATE POLICY "Owner can update market"    ON kn_market FOR UPDATE USING (auth.role()='authenticated');
CREATE POLICY "Anyone can read guilds"     ON kn_guilds FOR SELECT USING (true);
CREATE POLICY "Auth can create guild"      ON kn_guilds FOR INSERT WITH CHECK (auth.role()='authenticated');
CREATE POLICY "Auth can update guild"      ON kn_guilds FOR UPDATE USING (auth.role()='authenticated');
CREATE POLICY "Anyone can read members"    ON kn_guild_members FOR SELECT USING (true);
CREATE POLICY "Auth can manage members"    ON kn_guild_members FOR INSERT WITH CHECK (auth.role()='authenticated');
CREATE POLICY "Auth can delete member"     ON kn_guild_members FOR DELETE USING (auth.role()='authenticated');
CREATE POLICY "Auth can read requests"     ON kn_guild_requests FOR SELECT USING (auth.role()='authenticated');
CREATE POLICY "Auth can insert request"    ON kn_guild_requests FOR INSERT WITH CHECK (auth.role()='authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_status   ON kn_market(status);
CREATE INDEX IF NOT EXISTS idx_market_seller   ON kn_market(seller_name);
CREATE INDEX IF NOT EXISTS idx_guild_name      ON kn_guilds(name);
CREATE INDEX IF NOT EXISTS idx_guild_members   ON kn_guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_member_char     ON kn_guild_members(char_name);
