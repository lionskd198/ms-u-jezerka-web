import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "o_nas_statistiky" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "o_nas_statistiky" CASCADE;
  ALTER TABLE "o_nas" ADD COLUMN "hero_obrazek_id" integer;
  ALTER TABLE "o_nas" ADD CONSTRAINT "o_nas_hero_obrazek_id_media_id_fk" FOREIGN KEY ("hero_obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "o_nas_hero_obrazek_idx" ON "o_nas" USING btree ("hero_obrazek_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "o_nas_statistiky" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hodnota" varchar NOT NULL,
  	"popisek" varchar NOT NULL
  );
  
  ALTER TABLE "o_nas" DROP CONSTRAINT "o_nas_hero_obrazek_id_media_id_fk";
  
  DROP INDEX "o_nas_hero_obrazek_idx";
  ALTER TABLE "o_nas_statistiky" ADD CONSTRAINT "o_nas_statistiky_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."o_nas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "o_nas_statistiky_order_idx" ON "o_nas_statistiky" USING btree ("_order");
  CREATE INDEX "o_nas_statistiky_parent_id_idx" ON "o_nas_statistiky" USING btree ("_parent_id");
  ALTER TABLE "o_nas" DROP COLUMN "hero_obrazek_id";`)
}
