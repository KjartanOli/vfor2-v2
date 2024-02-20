import { query } from './lib/db.js';
import { parse_dir } from './lib/parse.js';

async function main() {
	const { teams, gamedays } = await parse_dir('./data');

	const users = [
		{
			id: 1,
			username: 'admin',
			name: 'Hr. admin',

			// 123
			password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
			admin: true,
		},
		{
			id: 2,
			username: 'oli',
			name: 'Óli',

			// 123
			password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
			admin: false,
		},
	];

	await Promise.all([
		Promise.all(users.map(user =>
			query(`
INSERT INTO users(id, username, name, password, admin)
 VALUES ($1, $2, $3, $4, $5)`,
				[user.id, user.username, user.name, user.password, user.admin])
		)),
		Promise.all(teams.map(team => query(`
INSERT INTO teams(name)
 VALUES($1);`,
			[team])
		)),
		Promise.all(gamedays.map(day =>
			Promise.all(day.games.map(async game => {
				const { home, away } = (await query(`
SELECT
   t1.id as home,
   t2.id as away
 FROM teams t1, teams t2
 WHERE t1.name = $1 AND t2.name = $2;`,
					[game.home.name, game.away.name])).rows[0];

				query(`
INSERT INTO games(date, home, away, home_score, away_score)
 VALUES($1, $2, $3, $4, $5);`,
					[day.date, home, away, game.home.score, game.away.score]);
			}))
		))
	]);
}

main().catch((e) => console.error(e));
