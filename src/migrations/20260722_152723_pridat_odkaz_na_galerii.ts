import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_aktuality_typ" ADD VALUE 'fotogalerie';
  ALTER TYPE "public"."enum__aktuality_v_version_typ" ADD VALUE 'fotogalerie';
  ALTER TABLE "aktuality" ADD COLUMN "odkaz_na_galerii" varchar;
  ALTER TABLE "_aktuality_v" ADD COLUMN "version_odkaz_na_galerii" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "aktuality" ALTER COLUMN "typ" SET DATA TYPE text;
  ALTER TABLE "aktuality" ALTER COLUMN "typ" SET DEFAULT 'informace'::text;
  DROP TYPE "public"."enum_aktuality_typ";
  CREATE TYPE "public"."enum_aktuality_typ" AS ENUM('informace', 'akce', 'dokument');
  ALTER TABLE "aktuality" ALTER COLUMN "typ" SET DEFAULT 'informace'::"public"."enum_aktuality_typ";
  ALTER TABLE "aktuality" ALTER COLUMN "typ" SET DATA TYPE "public"."enum_aktuality_typ" USING "typ"::"public"."enum_aktuality_typ";
  ALTER TABLE "_aktuality_v" ALTER COLUMN "version_typ" SET DATA TYPE text;
  ALTER TABLE "_aktuality_v" ALTER COLUMN "version_typ" SET DEFAULT 'informace'::text;
  DROP TYPE "public"."enum__aktuality_v_version_typ";
  CREATE TYPE "public"."enum__aktuality_v_version_typ" AS ENUM('informace', 'akce', 'dokument');
  ALTER TABLE "_aktuality_v" ALTER COLUMN "version_typ" SET DEFAULT 'informace'::"public"."enum__aktuality_v_version_typ";
  ALTER TABLE "_aktuality_v" ALTER COLUMN "version_typ" SET DATA TYPE "public"."enum__aktuality_v_version_typ" USING "version_typ"::"public"."enum__aktuality_v_version_typ";
  ALTER TABLE "aktuality" DROP COLUMN "odkaz_na_galerii";
  ALTER TABLE "_aktuality_v" DROP COLUMN "version_odkaz_na_galerii";`)
}
