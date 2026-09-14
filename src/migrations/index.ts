import * as migration_20260715_182152_initial_schema from './20260715_182152_initial_schema';
import * as migration_20260721_181650_pridat_o_nas_text_a_fotografie from './20260721_181650_pridat_o_nas_text_a_fotografie';
import * as migration_20260722_151051_odebrat_statistiky_pridat_hero_obrazek from './20260722_151051_odebrat_statistiky_pridat_hero_obrazek';
import * as migration_20260722_152723_pridat_odkaz_na_galerii from './20260722_152723_pridat_odkaz_na_galerii';
import * as migration_20260816_174359_pridat_tridy_odebrat_jidelnicek from './20260816_174359_pridat_tridy_odebrat_jidelnicek';
import * as migration_20260819_180453_pridat_fotografie_ucitelky_pole from './20260819_180453_pridat_fotografie_ucitelky_pole';
import * as migration_20260831_163524_pridat_projekty_a_fotky_trid from './20260831_163524_pridat_projekty_a_fotky_trid';
import * as migration_20260907_151737_pridat_platnost_aktualitam from './20260907_151737_pridat_platnost_aktualitam';

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
    name: '20260722_152723_pridat_odkaz_na_galerii',
  },
  {
    up: migration_20260816_174359_pridat_tridy_odebrat_jidelnicek.up,
    down: migration_20260816_174359_pridat_tridy_odebrat_jidelnicek.down,
    name: '20260816_174359_pridat_tridy_odebrat_jidelnicek',
  },
  {
    up: migration_20260819_180453_pridat_fotografie_ucitelky_pole.up,
    down: migration_20260819_180453_pridat_fotografie_ucitelky_pole.down,
    name: '20260819_180453_pridat_fotografie_ucitelky_pole',
  },
  {
    up: migration_20260831_163524_pridat_projekty_a_fotky_trid.up,
    down: migration_20260831_163524_pridat_projekty_a_fotky_trid.down,
    name: '20260831_163524_pridat_projekty_a_fotky_trid',
  },
  {
    up: migration_20260907_151737_pridat_platnost_aktualitam.up,
    down: migration_20260907_151737_pridat_platnost_aktualitam.down,
    name: '20260907_151737_pridat_platnost_aktualitam'
  },
];
