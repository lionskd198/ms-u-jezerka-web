import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_aktuality_rozeslani" AS ENUM('neposilat', 'vsem', 'tride');
  CREATE TYPE "public"."enum__aktuality_v_version_rozeslani" AS ENUM('neposilat', 'vsem', 'tride');
  CREATE TABLE "rodice" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"jmeno" varchar,
  	"odebira" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rodice_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tridy_id" integer
  );
  
  ALTER TABLE "aktuality" ADD COLUMN "rozeslani" "enum_aktuality_rozeslani" DEFAULT 'neposilat';
  ALTER TABLE "aktuality" ADD COLUMN "rozeslano_dne" timestamp(3) with time zone;
  ALTER TABLE "aktuality" ADD COLUMN "rozeslani_vysledek" varchar;
  ALTER TABLE "aktuality_rels" ADD COLUMN "tridy_id" integer;
  ALTER TABLE "_aktuality_v" ADD COLUMN "version_rozeslani" "enum__aktuality_v_version_rozeslani" DEFAULT 'neposilat';
  ALTER TABLE "_aktuality_v" ADD COLUMN "version_rozeslano_dne" timestamp(3) with time zone;
  ALTER TABLE "_aktuality_v" ADD COLUMN "version_rozeslani_vysledek" varchar;
  ALTER TABLE "_aktuality_v_rels" ADD COLUMN "tridy_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rodice_id" integer;
  ALTER TABLE "rodice_rels" ADD CONSTRAINT "rodice_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rodice"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rodice_rels" ADD CONSTRAINT "rodice_rels_tridy_fk" FOREIGN KEY ("tridy_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "rodice_email_idx" ON "rodice" USING btree ("email");
  CREATE INDEX "rodice_updated_at_idx" ON "rodice" USING btree ("updated_at");
  CREATE INDEX "rodice_created_at_idx" ON "rodice" USING btree ("created_at");
  CREATE INDEX "rodice_rels_order_idx" ON "rodice_rels" USING btree ("order");
  CREATE INDEX "rodice_rels_parent_idx" ON "rodice_rels" USING btree ("parent_id");
  CREATE INDEX "rodice_rels_path_idx" ON "rodice_rels" USING btree ("path");
  CREATE INDEX "rodice_rels_tridy_id_idx" ON "rodice_rels" USING btree ("tridy_id");
  ALTER TABLE "aktuality_rels" ADD CONSTRAINT "aktuality_rels_tridy_fk" FOREIGN KEY ("tridy_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aktuality_v_rels" ADD CONSTRAINT "_aktuality_v_rels_tridy_fk" FOREIGN KEY ("tridy_id") REFERENCES "public"."tridy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rodice_fk" FOREIGN KEY ("rodice_id") REFERENCES "public"."rodice"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "aktuality_rels_tridy_id_idx" ON "aktuality_rels" USING btree ("tridy_id");
  CREATE INDEX "_aktuality_v_rels_tridy_id_idx" ON "_aktuality_v_rels" USING btree ("tridy_id");
  CREATE INDEX "payload_locked_documents_rels_rodice_id_idx" ON "payload_locked_documents_rels" USING btree ("rodice_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "rodice" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rodice_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "rodice" CASCADE;
  DROP TABLE "rodice_rels" CASCADE;
  ALTER TABLE "aktuality_rels" DROP CONSTRAINT "aktuality_rels_tridy_fk";
  
  ALTER TABLE "_aktuality_v_rels" DROP CONSTRAINT "_aktuality_v_rels_tridy_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rodice_fk";
  
  DROP INDEX "aktuality_rels_tridy_id_idx";
  DROP INDEX "_aktuality_v_rels_tridy_id_idx";
  DROP INDEX "payload_locked_documents_rels_rodice_id_idx";
  ALTER TABLE "aktuality" DROP COLUMN "rozeslani";
  ALTER TABLE "aktuality" DROP COLUMN "rozeslano_dne";
  ALTER TABLE "aktuality" DROP COLUMN "rozeslani_vysledek";
  ALTER TABLE "aktuality_rels" DROP COLUMN "tridy_id";
  ALTER TABLE "_aktuality_v" DROP COLUMN "version_rozeslani";
  ALTER TABLE "_aktuality_v" DROP COLUMN "version_rozeslano_dne";
  ALTER TABLE "_aktuality_v" DROP COLUMN "version_rozeslani_vysledek";
  ALTER TABLE "_aktuality_v_rels" DROP COLUMN "tridy_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rodice_id";
  DROP TYPE "public"."enum_aktuality_rozeslani";
  DROP TYPE "public"."enum__aktuality_v_version_rozeslani";`)
}
