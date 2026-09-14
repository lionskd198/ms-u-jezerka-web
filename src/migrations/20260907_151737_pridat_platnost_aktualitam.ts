import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "aktuality" ADD COLUMN "platnost_do" timestamp(3) with time zone;
  ALTER TABLE "_aktuality_v" ADD COLUMN "version_platnost_do" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "aktuality" DROP COLUMN "platnost_do";
  ALTER TABLE "_aktuality_v" DROP COLUMN "version_platnost_do";`)
}
