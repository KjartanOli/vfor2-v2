import express from 'express';
import passport from 'passport';
import { insertGame, getTeams, getTeam, getGames, getGame } from '../lib/db.js';

export const adminRouter = express.Router();

function ensureLoggedIn(req, res, next) {
	if (req.url === '/login' || req.isAuthenticated()) {
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

async function adminRoute(req, res) {
	const user = req.user ?? null;
	const loggedIn = req.isAuthenticated();

	const teams = await getTeams();
	const games = await getGames();

	return res.render('admin', {
		title: 'Admin upplýsingar, mjög leynilegt',
		user,
		teams,
		games,
		loggedIn,
	});
}

function skraRoute(req, res, next) {
	return res.render('skra', {
		title: 'Skrá leik',
	});
}

async function skraRouteInsert(req, res, next) {
	const date = new Date(req.body.date);
	const home = parseInt(req.body.home, 10);
	const home_score = parseInt(req.body.home_score, 10);
	const away = parseInt(req.body.away, 10);
	const away_score = parseInt(req.body.away_score, 10);

	let min_date = new Date();
	min_date.setMonth(min_date.getMonth() - 2);
	const today = new Date();

	if (home === away) {
		next(Error('Home and Away can not be the same team'));
		return;
	}

	if (date < min_date || date > today) {
		next(Error('Invalid date'));
		return;
	}

	if (home_score < 0) {
		next(Error('Home score can not be negative'));
		return;
	}

	if (away_score < 0) {
		next(Error('Away score can not be negative'));
		return;
	}

	if (!(await getTeam(home))) {
		next(Error('Home team does not exist'));
		return;
	}

	if (!(await getTeam(away))) {
		next(Error('Away team does not exist'));
		return;
	}

	const result = insertGame(date, home, home_score, away, away_score);

	res.redirect('/admin');
}

function editRoute(req, res) {
	const id = parseInt(req.params.id);

	const teams = getTeams();
	const game = getGame(id);

	return res.render('edit', {
		title: 'Breyta leik',
		teams,
		game,
	});
}

function editRouteInsert(req, res) { }

adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.get('/skra', skraRoute);
adminRouter.post('/skra', skraRouteInsert);
adminRouter.get('/edit/:id(\\d+)', editRoute);
adminRouter.post('/edit/:id(\\d+)', editRouteInsert);

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
