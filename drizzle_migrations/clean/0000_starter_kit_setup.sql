CREATE TABLE IF NOT EXISTS "test_table" (
  "id" SERIAL PRIMARY KEY,
  "name" text
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "telegram_id" integer NOT NULL UNIQUE,
  "username" varchar(255),
  "first_name" varchar(255),
  "last_name" varchar(255),
  "language_code" varchar(10),
  "is_bot" boolean DEFAULT false,
  "subscription_level" varchar(50) NOT NULL DEFAULT 'free',
  "subscription_expires_at" timestamp,
  "last_active_at" timestamp DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" SERIAL PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "setting_key" varchar(255) NOT NULL,
  "setting_value" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "scene_states" (
  "id" SERIAL PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "scene_id" varchar(255) NOT NULL,
  "state_data" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" SERIAL PRIMARY KEY,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "action_type" varchar(100) NOT NULL,
  "action_details" jsonb,
  "performed_at" timestamp NOT NULL DEFAULT now(),
  "ip_address" varchar(50),
  "created_at" timestamp NOT NULL DEFAULT now()
); 