import pg from 'pg';
import { environment } from './environment.js';
import { logger } from './logger.js';

const env = environment(process.env, logger);

if (!env?.connectionString) {
  process.exit(-1);
}

const { connectionString } = env;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function getTeam(id) {
	const result = await query(`
SELECT id, name
FROM teams
WHERE id = $1`, [id]);

	if (result && (result.rows?.length ?? 0) > 0)
		return  result.rows[0].id;
	else
		return null;
}

export async function getTeams() {
	const result = await query(`
SELECT id, name
FROM teams;
`);

	return (result?.rows ?? []).map(row => ({ id: row.id, name: row.name }));
}

function makeGame(row) {
	return {
		id: row.id,
		date: row.date,
    home: {
      name: row.home_name,
      score: row.home_score,
    },
    away: {
      name: row.away_name,
      score: row.away_score,
    }
	}
}

export async function getGame(id) {
	const result = await query(`
    SELECT
      games.id,
      date,
      home_team.name AS home_name,
      home_score,
      away_team.name AS away_name,
      away_score
    FROM
      games
    LEFT JOIN
      teams AS home_team ON home_team.id = games.home
    LEFT JOIN
      teams AS away_team ON away_team.id = games.away
    WHERE games.id = $1
  `, [id]);

	if (result && (result.rows?.length ?? 0) > 0)
		return makeGame(result.rows[0]);

	return null;
}

export async function getGames() {
  const q = `
    SELECT
      games.id,
      date,
      home_team.name AS home_name,
      home_score,
      away_team.name AS away_name,
      away_score
    FROM
      games
    LEFT JOIN
      teams AS home_team ON home_team.id = games.home
    LEFT JOIN
      teams AS away_team ON away_team.id = games.away
    ORDER BY date DESC
  `;

  const result = await query(q);

	return (result?.rows ?? []).map(makeGame);
}

export function insertGame(date, home, home_score, away, away_score) {
  const q =
    'insert into games (date, home, away, home_score, away_score) values ($1, $2, $3, $4, $5);';

  const result = query(q, [date, home, away, home_score, away_score]);
}

export async function end() {
  await pool.end();
}
