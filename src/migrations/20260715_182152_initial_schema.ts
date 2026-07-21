import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_aktuality_typ" AS ENUM('informace', 'akce', 'dokument');
  CREATE TYPE "public"."enum_aktuality_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__aktuality_v_version_typ" AS ENUM('informace', 'akce', 'dokument');
  CREATE TYPE "public"."enum__aktuality_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_dokumenty_kategorie" AS ENUM('jidelnicek', 'prihlasky-a-zapis', 'rady-a-smernice', 'vzdelavaci-program', 'ostatni');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "aktuality" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev" varchar,
  	"slug" varchar,
  	"typ" "enum_aktuality_typ" DEFAULT 'informace',
  	"datum_akce" timestamp(3) with time zone,
  	"uvodni_obrazek_id" integer,
  	"obsah" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_aktuality_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "aktuality_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"dokumenty_id" integer
  );
  
  CREATE TABLE "_aktuality_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nazev" varchar,
  	"version_slug" varchar,
  	"version_typ" "enum__aktuality_v_version_typ" DEFAULT 'informace',
  	"version_datum_akce" timestamp(3) with time zone,
  	"version_uvodni_obrazek_id" integer,
  	"version_obsah" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__aktuality_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_aktuality_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"dokumenty_id" integer
  );
  
  CREATE TABLE "dokumenty" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev" varchar NOT NULL,
  	"kategorie" "enum_dokumenty_kategorie" DEFAULT 'ostatni' NOT NULL,
  	"popis" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_nahled_url" varchar,
  	"sizes_nahled_width" numeric,
  	"sizes_nahled_height" numeric,
  	"sizes_nahled_mime_type" varchar,
  	"sizes_nahled_filesize" numeric,
  	"sizes_nahled_filename" varchar,
  	"sizes_karta_url" varchar,
  	"sizes_karta_width" numeric,
  	"sizes_karta_height" numeric,
  	"sizes_karta_mime_type" varchar,
  	"sizes_karta_filesize" numeric,
  	"sizes_karta_filename" varchar,
  	"sizes_velky_url" varchar,
  	"sizes_velky_width" numeric,
  	"sizes_velky_height" numeric,
  	"sizes_velky_mime_type" varchar,
  	"sizes_velky_filesize" numeric,
  	"sizes_velky_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"jmeno" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"aktuality_id" integer,
  	"dokumenty_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "o_nas_statistiky" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hodnota" varchar NOT NULL,
  	"popisek" varchar NOT NULL
  );
  
  CREATE TABLE "o_nas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stitek" varchar DEFAULT 'Vítejte na webu naší školky',
  	"nadpis" varchar DEFAULT 'Mateřská škola U Jezérka' NOT NULL,
  	"podtitulek" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "kontakty_telefony" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"popisek" varchar NOT NULL,
  	"cislo" varchar NOT NULL
  );
  
  CREATE TABLE "kontakty_tridy" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nazev" varchar NOT NULL,
  	"vek" varchar,
  	"ucitelky" varchar
  );
  
  CREATE TABLE "kontakty_pedagogove" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"jmeno" varchar NOT NULL
  );
  
  CREATE TABLE "kontakty_provozni_zamestnanci" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"jmeno" varchar NOT NULL
  );
  
  CREATE TABLE "kontakty" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev_skoly" varchar NOT NULL,
  	"adresa" varchar,
  	"provozni_doba" varchar,
  	"email" varchar,
  	"facebook" varchar,
  	"vedouci" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "aktuality" ADD CONSTRAINT "aktuality_uvodni_obrazek_id_media_id_fk" FOREIGN KEY ("uvodni_obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "aktuality_rels" ADD CONSTRAINT "aktuality_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aktuality"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aktuality_rels" ADD CONSTRAINT "aktuality_rels_dokumenty_fk" FOREIGN KEY ("dokumenty_id") REFERENCES "public"."dokumenty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aktuality_v" ADD CONSTRAINT "_aktuality_v_parent_id_aktuality_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aktuality"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aktuality_v" ADD CONSTRAINT "_aktuality_v_version_uvodni_obrazek_id_media_id_fk" FOREIGN KEY ("version_uvodni_obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aktuality_v_rels" ADD CONSTRAINT "_aktuality_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_aktuality_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aktuality_v_rels" ADD CONSTRAINT "_aktuality_v_rels_dokumenty_fk" FOREIGN KEY ("dokumenty_id") REFERENCES "public"."dokumenty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aktuality_fk" FOREIGN KEY ("aktuality_id") REFERENCES "public"."aktuality"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dokumenty_fk" FOREIGN KEY ("dokumenty_id") REFERENCES "public"."dokumenty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "o_nas_statistiky" ADD CONSTRAINT "o_nas_statistiky_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."o_nas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kontakty_telefony" ADD CONSTRAINT "kontakty_telefony_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kontakty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kontakty_tridy" ADD CONSTRAINT "kontakty_tridy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kontakty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kontakty_pedagogove" ADD CONSTRAINT "kontakty_pedagogove_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kontakty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kontakty_provozni_zamestnanci" ADD CONSTRAINT "kontakty_provozni_zamestnanci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kontakty"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "aktuality_slug_idx" ON "aktuality" USING btree ("slug");
  CREATE INDEX "aktuality_uvodni_obrazek_idx" ON "aktuality" USING btree ("uvodni_obrazek_id");
  CREATE INDEX "aktuality_updated_at_idx" ON "aktuality" USING btree ("updated_at");
  CREATE INDEX "aktuality_created_at_idx" ON "aktuality" USING btree ("created_at");
  CREATE INDEX "aktuality__status_idx" ON "aktuality" USING btree ("_status");
  CREATE INDEX "aktuality_rels_order_idx" ON "aktuality_rels" USING btree ("order");
  CREATE INDEX "aktuality_rels_parent_idx" ON "aktuality_rels" USING btree ("parent_id");
  CREATE INDEX "aktuality_rels_path_idx" ON "aktuality_rels" USING btree ("path");
  CREATE INDEX "aktuality_rels_dokumenty_id_idx" ON "aktuality_rels" USING btree ("dokumenty_id");
  CREATE INDEX "_aktuality_v_parent_idx" ON "_aktuality_v" USING btree ("parent_id");
  CREATE INDEX "_aktuality_v_version_version_slug_idx" ON "_aktuality_v" USING btree ("version_slug");
  CREATE INDEX "_aktuality_v_version_version_uvodni_obrazek_idx" ON "_aktuality_v" USING btree ("version_uvodni_obrazek_id");
  CREATE INDEX "_aktuality_v_version_version_updated_at_idx" ON "_aktuality_v" USING btree ("version_updated_at");
  CREATE INDEX "_aktuality_v_version_version_created_at_idx" ON "_aktuality_v" USING btree ("version_created_at");
  CREATE INDEX "_aktuality_v_version_version__status_idx" ON "_aktuality_v" USING btree ("version__status");
  CREATE INDEX "_aktuality_v_created_at_idx" ON "_aktuality_v" USING btree ("created_at");
  CREATE INDEX "_aktuality_v_updated_at_idx" ON "_aktuality_v" USING btree ("updated_at");
  CREATE INDEX "_aktuality_v_latest_idx" ON "_aktuality_v" USING btree ("latest");
  CREATE INDEX "_aktuality_v_rels_order_idx" ON "_aktuality_v_rels" USING btree ("order");
  CREATE INDEX "_aktuality_v_rels_parent_idx" ON "_aktuality_v_rels" USING btree ("parent_id");
  CREATE INDEX "_aktuality_v_rels_path_idx" ON "_aktuality_v_rels" USING btree ("path");
  CREATE INDEX "_aktuality_v_rels_dokumenty_id_idx" ON "_aktuality_v_rels" USING btree ("dokumenty_id");
  CREATE INDEX "dokumenty_updated_at_idx" ON "dokumenty" USING btree ("updated_at");
  CREATE INDEX "dokumenty_created_at_idx" ON "dokumenty" USING btree ("created_at");
  CREATE UNIQUE INDEX "dokumenty_filename_idx" ON "dokumenty" USING btree ("filename");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_nahled_sizes_nahled_filename_idx" ON "media" USING btree ("sizes_nahled_filename");
  CREATE INDEX "media_sizes_karta_sizes_karta_filename_idx" ON "media" USING btree ("sizes_karta_filename");
  CREATE INDEX "media_sizes_velky_sizes_velky_filename_idx" ON "media" USING btree ("sizes_velky_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_aktuality_id_idx" ON "payload_locked_documents_rels" USING btree ("aktuality_id");
  CREATE INDEX "payload_locked_documents_rels_dokumenty_id_idx" ON "payload_locked_documents_rels" USING btree ("dokumenty_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "o_nas_statistiky_order_idx" ON "o_nas_statistiky" USING btree ("_order");
  CREATE INDEX "o_nas_statistiky_parent_id_idx" ON "o_nas_statistiky" USING btree ("_parent_id");
  CREATE INDEX "kontakty_telefony_order_idx" ON "kontakty_telefony" USING btree ("_order");
  CREATE INDEX "kontakty_telefony_parent_id_idx" ON "kontakty_telefony" USING btree ("_parent_id");
  CREATE INDEX "kontakty_tridy_order_idx" ON "kontakty_tridy" USING btree ("_order");
  CREATE INDEX "kontakty_tridy_parent_id_idx" ON "kontakty_tridy" USING btree ("_parent_id");
  CREATE INDEX "kontakty_pedagogove_order_idx" ON "kontakty_pedagogove" USING btree ("_order");
  CREATE INDEX "kontakty_pedagogove_parent_id_idx" ON "kontakty_pedagogove" USING btree ("_parent_id");
  CREATE INDEX "kontakty_provozni_zamestnanci_order_idx" ON "kontakty_provozni_zamestnanci" USING btree ("_order");
  CREATE INDEX "kontakty_provozni_zamestnanci_parent_id_idx" ON "kontakty_provozni_zamestnanci" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "aktuality" CASCADE;
  DROP TABLE "aktuality_rels" CASCADE;
  DROP TABLE "_aktuality_v" CASCADE;
  DROP TABLE "_aktuality_v_rels" CASCADE;
  DROP TABLE "dokumenty" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "o_nas_statistiky" CASCADE;
  DROP TABLE "o_nas" CASCADE;
  DROP TABLE "kontakty_telefony" CASCADE;
  DROP TABLE "kontakty_tridy" CASCADE;
  DROP TABLE "kontakty_pedagogove" CASCADE;
  DROP TABLE "kontakty_provozni_zamestnanci" CASCADE;
  DROP TABLE "kontakty" CASCADE;
  DROP TYPE "public"."enum_aktuality_typ";
  DROP TYPE "public"."enum_aktuality_status";
  DROP TYPE "public"."enum__aktuality_v_version_typ";
  DROP TYPE "public"."enum__aktuality_v_version_status";
  DROP TYPE "public"."enum_dokumenty_kategorie";
  DROP TYPE "public"."enum_users_role";`)
}
