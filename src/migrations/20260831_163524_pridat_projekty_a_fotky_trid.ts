import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tridy_fotky" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"obrazek_id" integer NOT NULL,
  	"nadpis" varchar,
  	"popis" varchar
  );
  
  CREATE TABLE "projekty" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nazev" varchar NOT NULL,
  	"popis" varchar,
  	"obrazek_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projekty_id" integer;
  ALTER TABLE "tridy_fotky" ADD CONSTRAINT "tridy_fotky_obrazek_id_media_id_fk" FOREIGN KEY ("obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tridy_fotky" ADD CONSTRAINT "tridy_fotky_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projekty" ADD CONSTRAINT "projekty_obrazek_id_media_id_fk" FOREIGN KEY ("obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tridy_fotky_order_idx" ON "tridy_fotky" USING btree ("_order");
  CREATE INDEX "tridy_fotky_parent_id_idx" ON "tridy_fotky" USING btree ("_parent_id");
  CREATE INDEX "tridy_fotky_obrazek_idx" ON "tridy_fotky" USING btree ("obrazek_id");
  CREATE INDEX "projekty_obrazek_idx" ON "projekty" USING btree ("obrazek_id");
  CREATE INDEX "projekty_updated_at_idx" ON "projekty" USING btree ("updated_at");
  CREATE INDEX "projekty_created_at_idx" ON "projekty" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projekty_fk" FOREIGN KEY ("projekty_id") REFERENCES "public"."projekty"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_projekty_id_idx" ON "payload_locked_documents_rels" USING btree ("projekty_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tridy_fotky" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projekty" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tridy_fotky" CASCADE;
  DROP TABLE "projekty" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projekty_fk";
  
  DROP INDEX "payload_locked_documents_rels_projekty_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projekty_id";`)
}
