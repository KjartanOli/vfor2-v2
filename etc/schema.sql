CREATE TABLE teams(
	id SERIAL PRIMARY KEY,
	name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE games(
	id SERIAL PRIMARY KEY,
	date DATE NOT NULL,
	home INT NOT NULL REFERENCES teams(id),
	away INT NOT NULL REFERENCES teams(id),
	home_score INT NOT NULL CHECK (home_score >= 0),
	away_score INT NOT NULL CHECK (away_score >= 0)
);

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(30) NOT NULL UNIQUE,
	password CHAR(60) NOT NULL
);
