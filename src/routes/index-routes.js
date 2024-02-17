import express from 'express';
import { getGames } from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
	return res.render('index', {
		title: 'Forsíða',
	});
}

async function leikirRoute(req, res) {
	const games = await getGames();

	return res.render('leikir', {
		title: 'Leikir',
		games,
	});
}

async function stadaRoute(req, res) {
	return res.render('stada', {
		title: 'Staðan',
	});
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
