import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_odeslane_emaily_stav" AS ENUM('odeslano', 'chyba');
  CREATE TABLE "odeslane_emaily" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prijemce" varchar NOT NULL,
  	"stav" "enum_odeslane_emaily_stav" NOT NULL,
  	"aktualita_id" integer,
  	"predmet" varchar,
  	"chyba" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "odeslane_emaily_id" integer;
  ALTER TABLE "odeslane_emaily" ADD CONSTRAINT "odeslane_emaily_aktualita_id_aktuality_id_fk" FOREIGN KEY ("aktualita_id") REFERENCES "public"."aktuality"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "odeslane_emaily_prijemce_idx" ON "odeslane_emaily" USING btree ("prijemce");
  CREATE INDEX "odeslane_emaily_aktualita_idx" ON "odeslane_emaily" USING btree ("aktualita_id");
  CREATE INDEX "odeslane_emaily_updated_at_idx" ON "odeslane_emaily" USING btree ("updated_at");
  CREATE INDEX "odeslane_emaily_created_at_idx" ON "odeslane_emaily" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_odeslane_emaily_fk" FOREIGN KEY ("odeslane_emaily_id") REFERENCES "public"."odeslane_emaily"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_odeslane_emaily_id_idx" ON "payload_locked_documents_rels" USING btree ("odeslane_emaily_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "odeslane_emaily" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "odeslane_emaily" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_odeslane_emaily_fk";
  
  DROP INDEX "payload_locked_documents_rels_odeslane_emaily_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "odeslane_emaily_id";
  DROP TYPE "public"."enum_odeslane_emaily_stav";`)
}
