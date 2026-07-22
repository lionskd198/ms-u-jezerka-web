import * as migration_20260715_182152_initial_schema from './20260715_182152_initial_schema';
import * as migration_20260721_181650_pridat_o_nas_text_a_fotografie from './20260721_181650_pridat_o_nas_text_a_fotografie';
import * as migration_20260722_151051_odebrat_statistiky_pridat_hero_obrazek from './20260722_151051_odebrat_statistiky_pridat_hero_obrazek';
import * as migration_20260722_152723_pridat_odkaz_na_galerii from './20260722_152723_pridat_odkaz_na_galerii';

export const migrations = [
  {
    up: migration_20260715_182152_initial_schema.up,
    down: migration_20260715_182152_initial_schema.down,
    name: '20260715_182152_initial_schema',
  },
  {
    up: migration_20260721_181650_pridat_o_nas_text_a_fotografie.up,
    down: migration_20260721_181650_pridat_o_nas_text_a_fotografie.down,
    name: '20260721_181650_pridat_o_nas_text_a_fotografie',
  },
  {
    up: migration_20260722_151051_odebrat_statistiky_pridat_hero_obrazek.up,
    down: migration_20260722_151051_odebrat_statistiky_pridat_hero_obrazek.down,
    name: '20260722_151051_odebrat_statistiky_pridat_hero_obrazek',
  },
  {
    up: migration_20260722_152723_pridat_odkaz_na_galerii.up,
    down: migration_20260722_152723_pridat_odkaz_na_galerii.down,
    name: '20260722_152723_pridat_odkaz_na_galerii'
  },
];
