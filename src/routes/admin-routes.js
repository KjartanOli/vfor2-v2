import express from 'express';
import passport from 'passport';
import {
	insertGame,
	getTeams,
	getTeam,
	getGames,
	getGame,
	updateGame,
	deleteGame
} from '../lib/db.js';

export const adminRouter = express.Router();

function ensureLoggedIn(req, res, next) {
	if (req.url === '/login' || req.url === '/styles.css' || req.isAuthenticated()) {
		return next();
	}

	return res.redirect('/login');
}

adminRouter.use(ensureLoggedIn);

async function indexRoute(req, res) {
	return res.render('login', {
		title: 'Innskráning',
	});
}

function logoutRoute(req, res, next) {
	req.logout((err) => {
		if (err)
			next(err)
		return res.redirect('/');
	});
}

async function adminRoute(req, res) {
	const teams = await getTeams();
	const games = await getGames();

	return res.render('admin', {
		title: 'Admin upplýsingar, mjög leynilegt',
		teams,
		games,
	});
}

async function validateGame(date, home, home_score, away, away_score) {
	const min_date = new Date();
	min_date.setMonth(min_date.getMonth() - 2);
	const today = new Date();

	if (home === away)
		return 'Heimalið og útilið geta ekki verið sama liðið';

	if (date < min_date || date > today)
		return 'Ógild dagsetning';

	if (home_score < 0)
		return 'Markatala heimaliðs getur ekki verið neikvæð'

	if (away_score < 0)
		return 'Markatala útiliðs getur ekki verið neikvæð';

	if (!(await getTeam(home)))
		return 'Heimalið er ekkk til';

	if (!(await getTeam(away)))
		return 'Útilið er ekki til';

	return null;
}

async function skraRouteInsert(req, res, next) {
	const date = new Date(req.body.date);
	const home = parseInt(req.body.home, 10);
	const home_score = parseInt(req.body.home_score, 10);
	const away = parseInt(req.body.away, 10);
	const away_score = parseInt(req.body.away_score, 10);

	const error = await validateGame(date, home, home_score, away, away_score);

	if (error)
		return next(error);

	insertGame(date, home, home_score, away, away_score);

	return res.redirect('/admin');
}

async function editRoute(req, res, next) {
	const id = parseInt(req.params.id, 10);

	const game = await getGame(id);
	if (!game)
		return next(Error('Leikur er ekki til'));

	const teams = await getTeams();

	return res.render('edit', {
		title: 'Breyta leik',
		teams,
		game,
	});
}

async function editRouteInsert(req, res, next) {
	const id = parseInt(req.params.id, 10);

	const game = await getGame(id);
	if (!game)
		return next(Error('Leikur er ekki til'));

	const date = new Date(req.body.date);
	const home = parseInt(req.body.home, 10);
	const home_score = parseInt(req.body.home_score, 10);
	const away = parseInt(req.body.away, 10);
	const away_score = parseInt(req.body.away_score, 10);

	const error = await validateGame(date, home, home_score, away, away_score);

	if (error)
		return next(error);

	updateGame(id, date, home, home_score, away, away_score);

	return res.redirect('/admin');
}

async function deleteRoute(req, res, next) {
	const id = parseInt(req.params.id, 10);

	const game = await getGame(id);
	if (!game)
		return next(Error('Leikur er ekki til'));

	deleteGame(id);
	return res.redirect('/admin');
}

adminRouter.get('/login', indexRoute);
adminRouter.post('/logout', logoutRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post('/skra', skraRouteInsert);
adminRouter.get('/admin/edit/:id(\\d+)', editRoute);
adminRouter.post('/admin/edit/:id(\\d+)', editRouteInsert);
adminRouter.post('/admin/delete/:id(\\d+)', deleteRoute);

adminRouter.post(
	'/login',

	// Þetta notar strat að ofan til að skrá notanda inn
	passport.authenticate('local', {
		failureMessage: 'Notandanafn eða lykilorð vitlaust.',
		failureRedirect: '/login',
	}),

	// Ef við komumst hingað var notandi skráður inn, senda á /admin
	(req, res) => {
		res.redirect('/admin');
	},
);
