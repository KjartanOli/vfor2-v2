import { query } from './lib/db.js';
import { parse_dir } from './lib/parse.js';

async function main() {
	const { teams, gamedays } = await parse_dir('./data');

	for (const team of teams)
		await query("INSERT INTO public.teams(name) VALUES($1);", [team]);

	console.log();

	for (const day of gamedays) {
		const { date, games } = day;

		for (const game of games) {
			const { home, away } = (await query("SELECT t1.id as home, t2.id as away FROM public.teams t1, public.teams t2 WHERE t1.name = $1 AND t2.name = $2;", [game.home.name, game.away.name])).rows[0];

			await query("INSERT INTO public.games(date, home, away, home_score, away_score) VALUES($1, $2, $3, $4, $5);", [date, home, away, game.home.score, game.away.score]);
		}
	}
}

main().catch((e) => console.error(e));
