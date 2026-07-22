import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "o_nas_fotografie" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"obrazek_id" integer NOT NULL,
  	"popisek" varchar
  );
  
  ALTER TABLE "o_nas" ADD COLUMN "o_nas_nadpis" varchar DEFAULT 'O nás';
  ALTER TABLE "o_nas" ADD COLUMN "o_nas_text" jsonb;
  ALTER TABLE "o_nas_fotografie" ADD CONSTRAINT "o_nas_fotografie_obrazek_id_media_id_fk" FOREIGN KEY ("obrazek_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "o_nas_fotografie" ADD CONSTRAINT "o_nas_fotografie_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."o_nas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "o_nas_fotografie_order_idx" ON "o_nas_fotografie" USING btree ("_order");
  CREATE INDEX "o_nas_fotografie_parent_id_idx" ON "o_nas_fotografie" USING btree ("_parent_id");
  CREATE INDEX "o_nas_fotografie_obrazek_idx" ON "o_nas_fotografie" USING btree ("obrazek_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "o_nas_fotografie" CASCADE;
  ALTER TABLE "o_nas" DROP COLUMN "o_nas_nadpis";
  ALTER TABLE "o_nas" DROP COLUMN "o_nas_text";`)
}
