import { query } from './lib/db.js';
import { parse_dir } from './lib/parse.js';

async function main() {
	const { teams, gamedays } = await parse_dir('./data');

	for (const team of teams)
		await query("INSERT INTO teams(name) VALUES($1);", [team]);

	console.log();

	for (const day of gamedays) {
		const { date, games } = day;

		for (const game of games) {
			const { home_id, away_id } = (await query("SELECT t1.id as home_id, t2.id as away_id FROM teams t1, teams t2 WHERE t1.name = $1 AND t2.name = $2;", [game.home.name, game.away.name])).rows[0];

			await query("INSERT INTO games(date, home, away, home_score, away_score) VALUES($1, $2, $3, $4, $5);", [date, home_id, away_id, game.home.score, game.away.score]);
		}
	}
}

main().catch((e) => console.error(e));
