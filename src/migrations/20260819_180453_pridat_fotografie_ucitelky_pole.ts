import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tridy_ucitelky" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"jmeno" varchar NOT NULL
  );

  CREATE TABLE "fotografie" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev_akce" varchar NOT NULL,
  	"trida_id" integer,
  	"text" varchar,
  	"odkaz" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fotografie_id" integer;

  ALTER TABLE "tridy_ucitelky" ADD CONSTRAINT "tridy_ucitelky_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fotografie" ADD CONSTRAINT "fotografie_trida_id_tridy_id_fk" FOREIGN KEY ("trida_id") REFERENCES "public"."tridy"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fotografie_fk" FOREIGN KEY ("fotografie_id") REFERENCES "public"."fotografie"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "tridy_ucitelky_order_idx" ON "tridy_ucitelky" USING btree ("_order");
  CREATE INDEX "tridy_ucitelky_parent_id_idx" ON "tridy_ucitelky" USING btree ("_parent_id");
  CREATE INDEX "fotografie_trida_idx" ON "fotografie" USING btree ("trida_id");
  CREATE INDEX "fotografie_updated_at_idx" ON "fotografie" USING btree ("updated_at");
  CREATE INDEX "fotografie_created_at_idx" ON "fotografie" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_fotografie_id_idx" ON "payload_locked_documents_rels" USING btree ("fotografie_id");

  INSERT INTO "tridy_ucitelky" ("_order", "_parent_id", "id", "jmeno")
  SELECT row_number() OVER (PARTITION BY t."id" ORDER BY u."ord"),
         t."id",
         substr(md5(random()::text || clock_timestamp()::text || u."ord"::text), 1, 24),
         btrim(u."jmeno")
  FROM "tridy" t,
       LATERAL unnest(string_to_array(t."ucitelky", ',')) WITH ORDINALITY AS u("jmeno", "ord")
  WHERE t."ucitelky" IS NOT NULL AND btrim(u."jmeno") <> '';

  ALTER TABLE "tridy" DROP COLUMN "ucitelky";

  INSERT INTO "fotografie" ("nazev_akce", "trida_id", "odkaz", "updated_at", "created_at")
  SELECT btrim(g."nazev_akce"), g."_parent_id", g."odkaz", now(), now()
  FROM "tridy_galerie" g;

  DROP TABLE "tridy_galerie" CASCADE;

  UPDATE "kontakty" SET "odkaz_na_jidelnicek" = 'http://www.zsratiskovice.cz/jidelna/jidelnicek-ms/' WHERE "odkaz_na_jidelnicek" IS NULL OR btrim("odkaz_na_jidelnicek") = '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tridy_galerie" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nazev_akce" varchar NOT NULL,
  	"odkaz" varchar NOT NULL
  );

  ALTER TABLE "tridy_galerie" ADD CONSTRAINT "tridy_galerie_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tridy_galerie_order_idx" ON "tridy_galerie" USING btree ("_order");
  CREATE INDEX "tridy_galerie_parent_id_idx" ON "tridy_galerie" USING btree ("_parent_id");

  INSERT INTO "tridy_galerie" ("_order", "_parent_id", "id", "nazev_akce", "odkaz")
  SELECT row_number() OVER (PARTITION BY f."trida_id" ORDER BY f."created_at"),
         f."trida_id",
         substr(md5(random()::text || clock_timestamp()::text), 1, 24),
         f."nazev_akce",
         f."odkaz"
  FROM "fotografie" f
  WHERE f."trida_id" IS NOT NULL;

  ALTER TABLE "tridy" ADD COLUMN "ucitelky" varchar;

  UPDATE "tridy" t SET "ucitelky" = sub."spojeno"
  FROM (
    SELECT "_parent_id", string_agg("jmeno", ', ' ORDER BY "_order") AS "spojeno"
    FROM "tridy_ucitelky"
    GROUP BY "_parent_id"
  ) sub
  WHERE t."id" = sub."_parent_id";

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fotografie_id";
  DROP TABLE "tridy_ucitelky" CASCADE;
  DROP TABLE "fotografie" CASCADE;`)
}
