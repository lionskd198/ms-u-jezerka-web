import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tridy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev" varchar NOT NULL,
  	"slug" varchar,
  	"vek" varchar,
  	"ucitelky" varchar,
  	"logo_id" integer,
  	"popis" varchar,
  	"obsah" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "tridy_galerie" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nazev_akce" varchar NOT NULL,
  	"odkaz" varchar NOT NULL
  );

  ALTER TABLE "kontakty" ADD COLUMN "odkaz_na_jidelnicek" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tridy_id" integer;

  ALTER TABLE "tridy" ADD CONSTRAINT "tridy_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tridy_galerie" ADD CONSTRAINT "tridy_galerie_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tridy_fk" FOREIGN KEY ("tridy_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;

  CREATE UNIQUE INDEX "tridy_slug_idx" ON "tridy" USING btree ("slug");
  CREATE INDEX "tridy_logo_idx" ON "tridy" USING btree ("logo_id");
  CREATE INDEX "tridy_updated_at_idx" ON "tridy" USING btree ("updated_at");
  CREATE INDEX "tridy_created_at_idx" ON "tridy" USING btree ("created_at");
  CREATE INDEX "tridy_galerie_order_idx" ON "tridy_galerie" USING btree ("_order");
  CREATE INDEX "tridy_galerie_parent_id_idx" ON "tridy_galerie" USING btree ("_parent_id");
  CREATE INDEX "payload_locked_documents_rels_tridy_id_idx" ON "payload_locked_documents_rels" USING btree ("tridy_id");

  INSERT INTO "tridy" ("nazev", "vek", "ucitelky", "updated_at", "created_at")
  SELECT "nazev", "vek", "ucitelky", now(), now() FROM "kontakty_tridy" ORDER BY "_order";

  UPDATE "tridy" SET "slug" = trim(both '-' from regexp_replace(translate(lower("nazev"), 'áäčďéěíľňóôöřšťúůüýž', 'aacdeeilnooorstuuuyz'), '[^a-z0-9]+', '-', 'g')) WHERE "slug" IS NULL;

  DROP TABLE "kontakty_tridy" CASCADE;

  UPDATE "dokumenty" SET "kategorie" = 'ostatni' WHERE "kategorie" = 'jidelnicek';
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DATA TYPE text;
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DEFAULT 'ostatni'::text;
  DROP TYPE "public"."enum_dokumenty_kategorie";
  CREATE TYPE "public"."enum_dokumenty_kategorie" AS ENUM('prihlasky-a-zapis', 'rady-a-smernice', 'vzdelavaci-program', 'ostatni');
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DEFAULT 'ostatni'::"public"."enum_dokumenty_kategorie";
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DATA TYPE "public"."enum_dokumenty_kategorie" USING "kategorie"::"public"."enum_dokumenty_kategorie";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "kontakty_tridy" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nazev" varchar NOT NULL,
  	"vek" varchar,
  	"ucitelky" varchar
  );

  ALTER TABLE "kontakty_tridy" ADD CONSTRAINT "kontakty_tridy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kontakty"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "kontakty_tridy_order_idx" ON "kontakty_tridy" USING btree ("_order");
  CREATE INDEX "kontakty_tridy_parent_id_idx" ON "kontakty_tridy" USING btree ("_parent_id");

  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DATA TYPE text;
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DEFAULT 'ostatni'::text;
  DROP TYPE "public"."enum_dokumenty_kategorie";
  CREATE TYPE "public"."enum_dokumenty_kategorie" AS ENUM('jidelnicek', 'prihlasky-a-zapis', 'rady-a-smernice', 'vzdelavaci-program', 'ostatni');
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DEFAULT 'ostatni'::"public"."enum_dokumenty_kategorie";
  ALTER TABLE "dokumenty" ALTER COLUMN "kategorie" SET DATA TYPE "public"."enum_dokumenty_kategorie" USING "kategorie"::"public"."enum_dokumenty_kategorie";

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tridy_id";
  ALTER TABLE "kontakty" DROP COLUMN "odkaz_na_jidelnicek";
  DROP TABLE "tridy_galerie" CASCADE;
  DROP TABLE "tridy" CASCADE;`)
}
