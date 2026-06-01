/**
 * Seeds the database with Super Rugby Pacific 2026 data.
 * Run with: npm run db:seed
 *
 * Idempotent — safe to run multiple times. Skips fixture insert if data exists.
 */
import { eq, count } from 'drizzle-orm';
import { db } from './index';
import { sports, leagues, seasons, teams, fixtures } from './schema';

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Sport ──────────────────────────────────────────────────────────────────
  const [sport] = await db
    .insert(sports)
    .values({ name: 'Rugby Union', slug: 'rugby' })
    .onConflictDoUpdate({ target: sports.slug, set: { name: 'Rugby Union' } })
    .returning();
  console.log(`✓ Sport: ${sport.name} (id ${sport.id})`);

  // ── League ─────────────────────────────────────────────────────────────────
  const [league] = await db
    .insert(leagues)
    .values({
      sportId:   sport.id,
      name:      'Super Rugby Pacific',
      shortName: 'SRP',
      slug:      'super-rugby-pacific',
      country:   'International',
      isActive:  true,
    })
    .onConflictDoUpdate({ target: leagues.slug, set: { name: 'Super Rugby Pacific' } })
    .returning();
  console.log(`✓ League: ${league.name} (id ${league.id})`);

  // ── Season ─────────────────────────────────────────────────────────────────
  const [season] = await db
    .insert(seasons)
    .values({ leagueId: league.id, year: '2026', isCurrent: true })
    .onConflictDoUpdate({
      target: [seasons.leagueId, seasons.year],
      set: { isCurrent: true },
    })
    .returning();
  console.log(`✓ Season: ${season.year} (id ${season.id})`);

  // ── Teams ──────────────────────────────────────────────────────────────────
  const teamData = [
    { sportId: sport.id, name: 'Blues',           shortName: 'BLU', slug: 'blues',          country: 'New Zealand', logoUrl: '/rugby/blues.png'        },
    { sportId: sport.id, name: 'Chiefs',           shortName: 'CHI', slug: 'chiefs',         country: 'New Zealand', logoUrl: '/rugby/chiefs.svg'        },
    { sportId: sport.id, name: 'Crusaders',        shortName: 'CRU', slug: 'crusaders',      country: 'New Zealand', logoUrl: '/rugby/crusaders.png'     },
    { sportId: sport.id, name: 'Highlanders',      shortName: 'HIG', slug: 'highlanders',    country: 'New Zealand', logoUrl: '/rugby/highlanders.png'   },
    { sportId: sport.id, name: 'Hurricanes',       shortName: 'HUR', slug: 'hurricanes',     country: 'New Zealand', logoUrl: '/rugby/hurricanes.png'    },
    { sportId: sport.id, name: 'ACT Brumbies',     shortName: 'BRU', slug: 'brumbies',       country: 'Australia',   logoUrl: '/rugby/brumbies.svg'      },
    { sportId: sport.id, name: 'Queensland Reds',  shortName: 'RED', slug: 'reds',           country: 'Australia',   logoUrl: '/rugby/reds.png'          },
    { sportId: sport.id, name: 'NSW Waratahs',     shortName: 'WAR', slug: 'waratahs',       country: 'Australia',   logoUrl: '/rugby/waratahs.svg'      },
    { sportId: sport.id, name: 'Western Force',    shortName: 'FOR', slug: 'force',          country: 'Australia',   logoUrl: '/rugby/westernforce.png'  },
    { sportId: sport.id, name: 'Fijian Drua',      shortName: 'DRU', slug: 'fijian-drua',    country: 'Fiji',        logoUrl: '/rugby/drua.png'          },
    { sportId: sport.id, name: 'Moana Pasifika',   shortName: 'MOA', slug: 'moana-pasifika', country: 'Pacific',     logoUrl: '/rugby/moana.png'         },
  ];

  await db
    .insert(teams)
    .values(teamData)
    .onConflictDoUpdate({ target: teams.slug, set: { name: teams.name } });

  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.sportId, sport.id));

  const bySlug = Object.fromEntries(allTeams.map(t => [t.slug, t.id]));
  console.log(`✓ Teams: ${allTeams.length} upserted`);

  // ── Fixtures ───────────────────────────────────────────────────────────────
  const [{ total }] = await db.select({ total: count() }).from(fixtures);
  if (total > 0) {
    console.log(`\n⚠ Fixtures already exist (${total} rows). Skipping fixture seed.`);
    console.log('  To re-seed, delete all rows from the fixtures table first.');
  } else {
    const fixtureData = [
      // Round 14 · Fri 22 – Sat 23 May 2026 (finished)
      { seasonId: season.id, homeTeamId: bySlug['blues'],      awayTeamId: bySlug['crusaders'],    scheduledAt: new Date('2026-05-22T08:05:00Z'), status: 'finished', round: 'Round 14', homeScore: 28, awayScore: 21 },
      { seasonId: season.id, homeTeamId: bySlug['hurricanes'], awayTeamId: bySlug['chiefs'],       scheduledAt: new Date('2026-05-22T10:05:00Z'), status: 'finished', round: 'Round 14', homeScore: 15, awayScore: 24 },
      { seasonId: season.id, homeTeamId: bySlug['brumbies'],   awayTeamId: bySlug['reds'],         scheduledAt: new Date('2026-05-23T07:45:00Z'), status: 'finished', round: 'Round 14', homeScore: 31, awayScore: 15 },
      { seasonId: season.id, homeTeamId: bySlug['waratahs'],   awayTeamId: bySlug['fijian-drua'],  scheduledAt: new Date('2026-05-23T09:05:00Z'), status: 'finished', round: 'Round 14', homeScore: 22, awayScore: 19 },
      { seasonId: season.id, homeTeamId: bySlug['force'],      awayTeamId: bySlug['highlanders'],  scheduledAt: new Date('2026-05-23T11:05:00Z'), status: 'finished', round: 'Round 14', homeScore: 14, awayScore: 27 },
      // Round 15 · Fri 29 – Sat 30 May 2026 (finished)
      { seasonId: season.id, homeTeamId: bySlug['crusaders'],  awayTeamId: bySlug['chiefs'],       scheduledAt: new Date('2026-05-29T08:05:00Z'), status: 'finished', round: 'Round 15', homeScore: 17, awayScore: 25 },
      { seasonId: season.id, homeTeamId: bySlug['blues'],      awayTeamId: bySlug['hurricanes'],   scheduledAt: new Date('2026-05-29T10:05:00Z'), status: 'finished', round: 'Round 15', homeScore: 34, awayScore: 17 },
      { seasonId: season.id, homeTeamId: bySlug['highlanders'],awayTeamId: bySlug['reds'],         scheduledAt: new Date('2026-05-30T07:45:00Z'), status: 'finished', round: 'Round 15', homeScore: 22, awayScore: 15 },
      { seasonId: season.id, homeTeamId: bySlug['moana-pasifika'], awayTeamId: bySlug['waratahs'], scheduledAt: new Date('2026-05-30T07:45:00Z'), status: 'finished', round: 'Round 15', homeScore: 28, awayScore: 21 },
      { seasonId: season.id, homeTeamId: bySlug['fijian-drua'],awayTeamId: bySlug['brumbies'],     scheduledAt: new Date('2026-05-30T09:05:00Z'), status: 'finished', round: 'Round 15', homeScore: 13, awayScore: 29 },
      // Round 16 · Fri 5 – Sat 6 Jun 2026 (scheduled)
      { seasonId: season.id, homeTeamId: bySlug['chiefs'],     awayTeamId: bySlug['blues'],        scheduledAt: new Date('2026-06-05T08:05:00Z'), status: 'scheduled', round: 'Round 16' },
      { seasonId: season.id, homeTeamId: bySlug['crusaders'],  awayTeamId: bySlug['hurricanes'],   scheduledAt: new Date('2026-06-05T10:05:00Z'), status: 'scheduled', round: 'Round 16' },
      { seasonId: season.id, homeTeamId: bySlug['brumbies'],   awayTeamId: bySlug['highlanders'],  scheduledAt: new Date('2026-06-06T07:45:00Z'), status: 'scheduled', round: 'Round 16' },
      { seasonId: season.id, homeTeamId: bySlug['reds'],       awayTeamId: bySlug['force'],        scheduledAt: new Date('2026-06-06T09:05:00Z'), status: 'scheduled', round: 'Round 16' },
      { seasonId: season.id, homeTeamId: bySlug['waratahs'],   awayTeamId: bySlug['moana-pasifika'],scheduledAt: new Date('2026-06-06T09:05:00Z'), status: 'scheduled', round: 'Round 16' },
      // Round 17 · Sat 13 Jun 2026 (scheduled)
      { seasonId: season.id, homeTeamId: bySlug['blues'],      awayTeamId: bySlug['brumbies'],     scheduledAt: new Date('2026-06-13T07:35:00Z'), status: 'scheduled', round: 'Round 17' },
      { seasonId: season.id, homeTeamId: bySlug['hurricanes'], awayTeamId: bySlug['highlanders'],  scheduledAt: new Date('2026-06-13T08:05:00Z'), status: 'scheduled', round: 'Round 17' },
      { seasonId: season.id, homeTeamId: bySlug['chiefs'],     awayTeamId: bySlug['fijian-drua'],  scheduledAt: new Date('2026-06-13T10:05:00Z'), status: 'scheduled', round: 'Round 17' },
      { seasonId: season.id, homeTeamId: bySlug['reds'],       awayTeamId: bySlug['waratahs'],     scheduledAt: new Date('2026-06-13T09:05:00Z'), status: 'scheduled', round: 'Round 17' },
    ];

    await db.insert(fixtures).values(fixtureData);
    console.log(`✓ Fixtures: ${fixtureData.length} inserted`);
  }

  console.log('\n✅ Seed complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
