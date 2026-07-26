// test-espn-spreads.mjs
const BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const YEAR = 2026;
const WEEK = 1;

const data = await fetch(
  `${BASE}/scoreboard?dates=${YEAR}&seasontype=2&week=${WEEK}`
).then((r) => r.json());

console.log(`Week ${WEEK}, ${YEAR} — ${data.events.length} games\n`);

for (const game of data.events) {
  const comp = game.competitions[0];
  const home = comp.competitors.find((c) => c.homeAway === 'home');
  const away = comp.competitors.find((c) => c.homeAway === 'away');
  const odds = comp.odds?.[0];

  console.log(`${away.team.abbreviation} @ ${home.team.abbreviation}`);
  if (odds) {
    console.log(`  provider:   ${odds.provider?.name ?? 'n/a'}`);
    console.log(`  spread:     ${odds.spread ?? 'n/a'}        (negative = home favored)`);
    console.log(`  details:    ${odds.details ?? 'n/a'}       (e.g. "KC -3.5")`);
    console.log(`  over/under: ${odds.overUnder ?? 'n/a'}`);
    console.log(`  home ML:    ${odds.homeTeamOdds?.moneyLine ?? 'n/a'}`);
    console.log(`  away ML:    ${odds.awayTeamOdds?.moneyLine ?? 'n/a'}`);
  } else {
    console.log('  no odds posted yet');
  }
  console.log('');
}
