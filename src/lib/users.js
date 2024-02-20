/**
 * "Static notendagrunnur"
 * Notendur eru harðkóðaðir og ekkert hægt að breyta þeim.
 * Ef við notum notendagagnagrunn, t.d. í postgres, útfærum við leit að notendum
 * hér, ásamt því að passa upp á að lykilorð séu lögleg.
 */

import bcrypt from 'bcrypt';
import { query } from '../lib/db.js'

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }

  return false;
}

// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findByUsername(username) {
	const result = await query(`
SELECT id, username, name, password
FROM users
WHERE username = $1`, [username]);

	if (result && (result.rows?.length ?? 0) > 0)
		return result.rows[0];

	return null;
}

// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findById(id) {
	const result = await query(`
SELECT id, username, name, password
FROM users
WHERE id = $1`, [id]);

	if (result && (result.rows?.length ?? 0) > 0)
		return result.rows[0];

	return null;
}
