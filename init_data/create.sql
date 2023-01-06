CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,

	-- User Data --
    username VARCHAR(50) NOT NULL,
	password CHAR(60) NOT NULL,
	admin BOOLEAN,
	img VARCHAR(300),					-- profile picture
	class VARCHAR(10),					-- freshman, sophomore, junior or senior
	major VARCHAR(50),					-- major
	committee VARCHAR(50),				-- chapter committee
	net_group VARCHAR(50),				-- weekly networking group

	-- Assignments --
	preliminary_forms BOOLEAN,
	big_brother_mentor BOOLEAN,
	getting_to_know_you BOOLEAN,
	informational_interviews BOOLEAN,

	-- Statistics --
	resume VARCHAR(100),
	domingos INT,
	brother_interviews INT,
	points INT NOT NULL
);

CREATE TABLE brother_interviews(
	interview_id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL,
	brother VARCHAR(50) NOT NULL,
	family VARCHAR(20) NOT NULL,
	proof VARCHAR(50) NOT NULL
);
