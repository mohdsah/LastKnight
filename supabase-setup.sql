-- ═══════════════════════════════════════════════════════════════════
-- PAHLAWAN TERAKHIR — SQL Setup Lengkap v2.0
-- Selamat dijalankan pada DB SEDIA ADA mahupun DB BARU
-- Semua perintah guna IF NOT EXISTS / IF EXISTS / ON CONFLICT
-- ═══════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 1: TABLE ASAS
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kn_usernames (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_players (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_name      TEXT UNIQUE NOT NULL,
  faction        TEXT NOT NULL DEFAULT 'elmorad',
  race           TEXT NOT NULL DEFAULT 'human',
  job            TEXT NOT NULL DEFAULT 'warrior',
  face_idx       INT DEFAULT 0,
  level          INT DEFAULT 1,
  xp             INT DEFAULT 0,
  gold           INT DEFAULT 3000,
  best_wave      INT DEFAULT 0,
  best_score     INT DEFAULT 0,
  skill_pts      INT DEFAULT 0,
  stat_pts       INT DEFAULT 0,
  banned         BOOLEAN DEFAULT false,
  current_zone   TEXT DEFAULT 'moradon',
  stat_str       INT DEFAULT 70,
  stat_hp        INT DEFAULT 70,
  stat_dex       INT DEFAULT 65,
  stat_int       INT DEFAULT 55,
  stat_mp        INT DEFAULT 55,
  inventory      JSONB DEFAULT '{}',
  equipment      JSONB DEFAULT '{}',
  skill_tree     JSONB DEFAULT '{}',
  daily_progress JSONB DEFAULT '{}',
  quest_progress JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_leaderboard (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_name  TEXT,
  faction    TEXT,
  zone       TEXT DEFAULT 'moradon',
  score      INT DEFAULT 0,
  wave       INT DEFAULT 1,
  level      INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_gm (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  gm_name    TEXT NOT NULL,
  role       TEXT DEFAULT 'gm',
  is_banned  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_bans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name  TEXT NOT NULL,
  reason     TEXT,
  banned_by  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_broadcast (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'system',
  sent_by    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_gm_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gm_name    TEXT,
  action     TEXT,
  target     TEXT,
  detail     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 2: TABLE EKONOMI
-- ════════════════════════════════════════════════════════════════════

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
  status      TEXT DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS kn_point_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name   TEXT,
  account_id  UUID,
  type        TEXT,
  points      INT DEFAULT 0,
  description TEXT,
  balance     INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_market (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name TEXT NOT NULL,
  account_id  UUID,
  item_id     TEXT NOT NULL,
  item_name   TEXT,
  item_type   TEXT,
  item_icon   TEXT,
  item_rarity TEXT DEFAULT 'common',
  enh         INT DEFAULT 0,
  qty         INT DEFAULT 1,
  price       INT NOT NULL,
  status      TEXT DEFAULT 'active',
  buyer_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_guilds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT UNIQUE NOT NULL,
  motto        TEXT DEFAULT '',
  emblem       TEXT DEFAULT '🏰',
  faction      TEXT DEFAULT 'elmorad',
  leader_name  TEXT,
  level        INT DEFAULT 1,
  exp          INT DEFAULT 0,
  member_count INT DEFAULT 1,
  max_members  INT DEFAULT 20,
  is_public    BOOLEAN DEFAULT true,
  invite_code  TEXT UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_guild_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id   UUID REFERENCES kn_guilds(id) ON DELETE CASCADE,
  char_name  TEXT NOT NULL,
  account_id UUID,
  rank       TEXT DEFAULT 'member',
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(char_name)
);

CREATE TABLE IF NOT EXISTS kn_guild_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id   UUID REFERENCES kn_guilds(id) ON DELETE CASCADE,
  char_name  TEXT NOT NULL,
  account_id UUID,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 3: TABLE BARU (PvP, Castle, Zone Event, Daily Quest)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kn_pvp_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  killer_name TEXT NOT NULL,
  killer_fac  TEXT,
  victim_name TEXT NOT NULL,
  victim_fac  TEXT,
  zone        TEXT DEFAULT 'cz',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_pvp_ranking (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name   TEXT UNIQUE NOT NULL,
  account_id  UUID,
  faction     TEXT,
  kills       INT DEFAULT 0,
  deaths      INT DEFAULT 0,
  pk_points   INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_castle_status (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  castle_id   TEXT UNIQUE NOT NULL,
  owner_guild TEXT,
  owner_fac   TEXT,
  captured_at TIMESTAMPTZ,
  hp          INT DEFAULT 1000,
  max_hp      INT DEFAULT 1000,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_zone_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     TEXT UNIQUE NOT NULL,
  event_type  TEXT DEFAULT 'boss',
  active      BOOLEAN DEFAULT false,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  meta        JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kn_daily_quests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name   TEXT NOT NULL,
  account_id  UUID,
  quest_date  DATE DEFAULT CURRENT_DATE,
  progress    JSONB DEFAULT '{}',
  completed   JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(char_name, quest_date)
);

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 4: MIGRATE KOLUM (selamat untuk DB sedia ada)
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS banned          BOOLEAN DEFAULT false;
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS stat_pts        INT DEFAULT 0;
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS skill_pts       INT DEFAULT 0;
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS current_zone    TEXT DEFAULT 'moradon';
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS daily_progress  JSONB DEFAULT '{}';
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS quest_progress  JSONB DEFAULT '{}';
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS inventory       JSONB DEFAULT '{}';
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS equipment       JSONB DEFAULT '{}';
ALTER TABLE kn_players    ADD COLUMN IF NOT EXISTS skill_tree      JSONB DEFAULT '{}';
ALTER TABLE kn_leaderboard ADD COLUMN IF NOT EXISTS zone           TEXT DEFAULT 'moradon';

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 5: RLS
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE kn_usernames      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_players        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_leaderboard    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_gm             ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_bans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_broadcast      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_gm_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_topup_codes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_point_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_market         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guilds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guild_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_guild_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_pvp_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_pvp_ranking    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_castle_status  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_zone_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kn_daily_quests   ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 6: POLICY (DROP dulu, cipta semula)
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "pub_read_usernames"    ON kn_usernames;
DROP POLICY IF EXISTS "owner_insert_username" ON kn_usernames;
DROP POLICY IF EXISTS "owner_delete_username" ON kn_usernames;
CREATE POLICY "pub_read_usernames"    ON kn_usernames FOR SELECT USING (true);
CREATE POLICY "owner_insert_username" ON kn_usernames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_delete_username" ON kn_usernames FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pub_read_players"    ON kn_players;
DROP POLICY IF EXISTS "owner_insert_player" ON kn_players;
DROP POLICY IF EXISTS "owner_update_player" ON kn_players;
DROP POLICY IF EXISTS "owner_delete_player" ON kn_players;
CREATE POLICY "pub_read_players"    ON kn_players FOR SELECT USING (true);
CREATE POLICY "owner_insert_player" ON kn_players FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY "owner_update_player" ON kn_players FOR UPDATE USING (auth.uid() = account_id);
CREATE POLICY "owner_delete_player" ON kn_players FOR DELETE USING (auth.uid() = account_id);

DROP POLICY IF EXISTS "pub_read_lb"    ON kn_leaderboard;
DROP POLICY IF EXISTS "owner_insert_lb" ON kn_leaderboard;
CREATE POLICY "pub_read_lb"    ON kn_leaderboard FOR SELECT USING (true);
CREATE POLICY "owner_insert_lb" ON kn_leaderboard FOR INSERT WITH CHECK (auth.uid() = account_id);

DROP POLICY IF EXISTS "gm_read_own"  ON kn_gm;
DROP POLICY IF EXISTS "no_public_gm" ON kn_gm;
CREATE POLICY "gm_read_own"  ON kn_gm FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "no_public_gm" ON kn_gm FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "pub_read_bans"   ON kn_bans;
DROP POLICY IF EXISTS "auth_insert_ban" ON kn_bans;
DROP POLICY IF EXISTS "auth_delete_ban" ON kn_bans;
CREATE POLICY "pub_read_bans"   ON kn_bans FOR SELECT USING (true);
CREATE POLICY "auth_insert_ban" ON kn_bans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_ban" ON kn_bans FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_broadcast"    ON kn_broadcast;
DROP POLICY IF EXISTS "auth_insert_broadcast" ON kn_broadcast;
CREATE POLICY "pub_read_broadcast"    ON kn_broadcast FOR SELECT USING (true);
CREATE POLICY "auth_insert_broadcast" ON kn_broadcast FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_read_gmlog"   ON kn_gm_log;
DROP POLICY IF EXISTS "auth_insert_gmlog" ON kn_gm_log;
CREATE POLICY "auth_read_gmlog"   ON kn_gm_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_gmlog" ON kn_gm_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "owner_read_topup"   ON kn_topup_requests;
DROP POLICY IF EXISTS "owner_insert_topup" ON kn_topup_requests;
CREATE POLICY "owner_read_topup"   ON kn_topup_requests FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY "owner_insert_topup" ON kn_topup_requests FOR INSERT WITH CHECK (auth.uid() = account_id);

DROP POLICY IF EXISTS "pub_read_codes" ON kn_topup_codes;
DROP POLICY IF EXISTS "auth_use_codes" ON kn_topup_codes;
CREATE POLICY "pub_read_codes" ON kn_topup_codes FOR SELECT USING (true);
CREATE POLICY "auth_use_codes" ON kn_topup_codes FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "owner_read_pointlog"  ON kn_point_log;
DROP POLICY IF EXISTS "auth_insert_pointlog" ON kn_point_log;
CREATE POLICY "owner_read_pointlog"  ON kn_point_log FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY "auth_insert_pointlog" ON kn_point_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_market"    ON kn_market;
DROP POLICY IF EXISTS "auth_insert_market" ON kn_market;
DROP POLICY IF EXISTS "auth_update_market" ON kn_market;
CREATE POLICY "pub_read_market"    ON kn_market FOR SELECT USING (true);
CREATE POLICY "auth_insert_market" ON kn_market FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_market" ON kn_market FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_guilds"   ON kn_guilds;
DROP POLICY IF EXISTS "auth_create_guild" ON kn_guilds;
DROP POLICY IF EXISTS "auth_update_guild" ON kn_guilds;
CREATE POLICY "pub_read_guilds"   ON kn_guilds FOR SELECT USING (true);
CREATE POLICY "auth_create_guild" ON kn_guilds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_guild" ON kn_guilds FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_members"    ON kn_guild_members;
DROP POLICY IF EXISTS "auth_manage_members" ON kn_guild_members;
DROP POLICY IF EXISTS "auth_delete_member"  ON kn_guild_members;
CREATE POLICY "pub_read_members"    ON kn_guild_members FOR SELECT USING (true);
CREATE POLICY "auth_manage_members" ON kn_guild_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_member"  ON kn_guild_members FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_read_requests"   ON kn_guild_requests;
DROP POLICY IF EXISTS "auth_insert_requests" ON kn_guild_requests;
CREATE POLICY "auth_read_requests"   ON kn_guild_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_requests" ON kn_guild_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_pvplog"    ON kn_pvp_log;
DROP POLICY IF EXISTS "auth_insert_pvplog" ON kn_pvp_log;
CREATE POLICY "pub_read_pvplog"    ON kn_pvp_log FOR SELECT USING (true);
CREATE POLICY "auth_insert_pvplog" ON kn_pvp_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_pvprank"    ON kn_pvp_ranking;
DROP POLICY IF EXISTS "auth_upsert_pvprank" ON kn_pvp_ranking;
CREATE POLICY "pub_read_pvprank"    ON kn_pvp_ranking FOR SELECT USING (true);
CREATE POLICY "auth_upsert_pvprank" ON kn_pvp_ranking FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_castle"    ON kn_castle_status;
DROP POLICY IF EXISTS "auth_update_castle" ON kn_castle_status;
CREATE POLICY "pub_read_castle"    ON kn_castle_status FOR SELECT USING (true);
CREATE POLICY "auth_update_castle" ON kn_castle_status FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pub_read_zoneevents"    ON kn_zone_events;
DROP POLICY IF EXISTS "auth_manage_zoneevents" ON kn_zone_events;
CREATE POLICY "pub_read_zoneevents"    ON kn_zone_events FOR SELECT USING (true);
CREATE POLICY "auth_manage_zoneevents" ON kn_zone_events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "owner_read_dailyq"  ON kn_daily_quests;
DROP POLICY IF EXISTS "auth_upsert_dailyq" ON kn_daily_quests;
CREATE POLICY "owner_read_dailyq"  ON kn_daily_quests FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY "auth_upsert_dailyq" ON kn_daily_quests FOR ALL
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 7: INDEX
-- ════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_usernames_name    ON kn_usernames     (username);
CREATE INDEX IF NOT EXISTS idx_usernames_uid     ON kn_usernames     (user_id);
CREATE INDEX IF NOT EXISTS idx_players_account   ON kn_players       (account_id);
CREATE INDEX IF NOT EXISTS idx_players_charname  ON kn_players       (char_name);
CREATE INDEX IF NOT EXISTS idx_players_faction   ON kn_players       (faction);
CREATE INDEX IF NOT EXISTS idx_players_zone      ON kn_players       (current_zone);
CREATE INDEX IF NOT EXISTS idx_lb_score          ON kn_leaderboard   (score DESC);
CREATE INDEX IF NOT EXISTS idx_lb_zone           ON kn_leaderboard   (zone);
CREATE INDEX IF NOT EXISTS idx_bans_charname     ON kn_bans          (char_name);
CREATE INDEX IF NOT EXISTS idx_gmlog_created     ON kn_gm_log        (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topup_status      ON kn_topup_requests(status);
CREATE INDEX IF NOT EXISTS idx_topup_codes       ON kn_topup_codes   (code);
CREATE INDEX IF NOT EXISTS idx_pointlog_char     ON kn_point_log     (char_name);
CREATE INDEX IF NOT EXISTS idx_market_status     ON kn_market        (status);
CREATE INDEX IF NOT EXISTS idx_market_seller     ON kn_market        (seller_name);
CREATE INDEX IF NOT EXISTS idx_market_item       ON kn_market        (item_id);
CREATE INDEX IF NOT EXISTS idx_guild_name        ON kn_guilds        (name);
CREATE INDEX IF NOT EXISTS idx_guild_faction     ON kn_guilds        (faction);
CREATE INDEX IF NOT EXISTS idx_gmembers_guild    ON kn_guild_members (guild_id);
CREATE INDEX IF NOT EXISTS idx_gmembers_char     ON kn_guild_members (char_name);
CREATE INDEX IF NOT EXISTS idx_pvplog_killer     ON kn_pvp_log       (killer_name);
CREATE INDEX IF NOT EXISTS idx_pvplog_victim     ON kn_pvp_log       (victim_name);
CREATE INDEX IF NOT EXISTS idx_pvplog_created    ON kn_pvp_log       (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pvprank_kills     ON kn_pvp_ranking   (kills DESC);
CREATE INDEX IF NOT EXISTS idx_pvprank_pk        ON kn_pvp_ranking   (pk_points DESC);
CREATE INDEX IF NOT EXISTS idx_pvprank_char      ON kn_pvp_ranking   (char_name);
CREATE INDEX IF NOT EXISTS idx_dailyq_char       ON kn_daily_quests  (char_name);
CREATE INDEX IF NOT EXISTS idx_dailyq_date       ON kn_daily_quests  (quest_date);

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 8: FUNGSI DATABASE
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION add_gold_to_player(p_char_name TEXT, p_gold INT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE kn_players SET gold = gold + p_gold WHERE char_name = p_char_name;
END;
$$;

CREATE OR REPLACE FUNCTION upsert_pvp_ranking(
  p_char_name  TEXT,
  p_account_id UUID,
  p_faction    TEXT,
  p_kills      INT DEFAULT 0,
  p_deaths     INT DEFAULT 0,
  p_pk_points  INT DEFAULT 0,
  p_streak     INT DEFAULT 0
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO kn_pvp_ranking
    (char_name, account_id, faction, kills, deaths, pk_points, best_streak, updated_at)
  VALUES
    (p_char_name, p_account_id, p_faction, p_kills, p_deaths, p_pk_points, p_streak, NOW())
  ON CONFLICT (char_name) DO UPDATE SET
    kills       = GREATEST(kn_pvp_ranking.kills,       p_kills),
    deaths      = GREATEST(kn_pvp_ranking.deaths,      p_deaths),
    pk_points   = p_pk_points,
    best_streak = GREATEST(kn_pvp_ranking.best_streak, p_streak),
    faction     = p_faction,
    updated_at  = NOW();
END;
$$;

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 9: DATA AWAL
-- ════════════════════════════════════════════════════════════════════

INSERT INTO kn_castle_status (castle_id, owner_guild, owner_fac, hp, max_hp)
VALUES
  ('el_morad', NULL, NULL, 1000, 1000),
  ('luferson', NULL, NULL, 1000, 1000)
ON CONFLICT (castle_id) DO NOTHING;

INSERT INTO kn_zone_events (zone_id, event_type, active, meta)
VALUES
  ('bifrost',  'boss_event', false, '{"boss":"isiloon","interval_hours":2}'),
  ('cz',       'siege',      false, '{"interval_hours":6}'),
  ('eslant',   'boss_event', false, '{"boss":"felankor","interval_hours":4}')
ON CONFLICT (zone_id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 10: REALTIME
-- ════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE kn_players;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_pvp_log;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_pvp_ranking;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_castle_status;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_broadcast;
ALTER PUBLICATION supabase_realtime ADD TABLE kn_zone_events;

-- ════════════════════════════════════════════════════════════════════
-- BAHAGIAN 11: DAFTAR GM — PelituN03
-- Uncomment & run SELEPAS daftar akaun dalam game
-- ════════════════════════════════════════════════════════════════════

/*
INSERT INTO kn_gm (user_id, gm_name, role)
SELECT id, 'PelituN03', 'admin'
FROM auth.users
WHERE email = 'pelitun03@pahlawan-terakhir.game'
LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET gm_name = 'PelituN03', role = 'admin';

SELECT gm_name, role, created_at FROM kn_gm WHERE gm_name = 'PelituN03';
*/

-- ════════════════════════════════════════════════════════════════════
-- SEMAK AKHIR
-- ════════════════════════════════════════════════════════════════════
SELECT tablename, rowsecurity AS rls
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'kn_%'
ORDER BY tablename;
