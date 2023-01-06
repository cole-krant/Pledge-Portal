/* DATABASE INITIALIZATION ------------------------------------------------------ */
/* INCLUDES */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const session = require("express-session");
app.use(bodyParser.json());
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 80;

/* DATABSE CONFIGURATION */
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

/* TEST DATABASE CONNECTION */
db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

/* SET THE VIEW ENGINE TO EJS */
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/'));

/* INITIALIZE SESSION VARIABLES */
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

/* ENCODE URL */
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

/* USERS TABLE EJS REFERENCE */
const user = {
    user_id:undefined,
    username:undefined,
    password:undefined,
    admin:undefined,
    img:undefined,
    class:undefined,
    major:undefined,
    committee:undefined,
    net_group:undefined,
    preliminary_forms:undefined,
    big_brother_mentor:undefined,
    getting_to_know_you:undefined,
    informational_interviews:undefined,
    resume:undefined,
    domingos: undefined,
    brother_interviews:undefined,
    points:undefined
}

/* NAVIGATION ROUTES -------------------------------------------------------------- */
app.get('/', (req, res) => {                    // upon entry user goes to login
    res.render("pages/login");
});
app.get('/register', (req, res) => {            // navigate to register page
    res.render("pages/register");
});
app.get('/login', (req, res) => {               // navigate to the login page
    res.render("pages/login");
});
app.get("/logout", (req, res) => {              // terminate the session
    req.session.destroy();
    res.render("pages/logout");
});
/* POST REGISTER : rediredct to login ---------------------------------------------- */
/* NEED TO IMPLIMENT CONSTRAINT WHERE USERNAMES ARE THE SAME */
app.post('/register', async (req, res) => {

    const hash = await bcrypt.hash(req.body.password, 8);
    const query = `INSERT INTO users (username, password, admin, img, points) VALUES ($1, $2, $3, $4, $5);`;

    db.none(query, [req.body.username, hash, 'false', '../../resources/pfp/Default_Avatar.jpg', 0])
        .then((data) => {
            req.session.user = {
                username:req.body.username,
                password:hash,
                admin:'false',
                img:'../../resources/pfp/Default_Avatar.jpg',
                class:'',
                major:'',
                committee:'',
                net_group:'',
                preliminary_forms:'false',
                big_brother_mentor:'false',
                getting_to_know_you:'false',
                informational_interviews:'false',
                resume:'',
                domingos: 0,
                brother_interviews: 0,
                points: 0
            }

            req.session.save();
            res.redirect("/login");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
            res.redirect("/register");
        });
});
/* POST LOGIN : redirect to register ? survey? ------------------------------------- */
app.post('/login', async (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1;`;

    db.one(query, [req.body.username, req.body.password])
        .then(async (client) => {

            const match = await bcrypt.compare(req.body.password, client.password);
            const hash = await bcrypt.hash(req.body.password, 8);

            if (match) {
                req.session.user = {
                    user_id: client.user_id,
                    username: req.body.username,
                    password: hash,
                    admin: client.admin,
                    img: client.img,
                    class: client.class,
                    major: client.major,
                    committee: client.committee,
                    net_group: client.net_group,
                    preliminary_forms: client.preliminary_forms,
                    big_brother_mentor: client.big_brother_mentor,
                    getting_to_know_you: client.getting_to_know_you,
                    informational_interviews: client.informational_interviews,
                    resume: client.resume,
                    domingos: client.domingos,
                    brother_interviews: client.brother_interviews,
                    points: client.points
                }
                
                req.session.save();
                res.redirect('/home');
            }
            else {
                res.redirect('pages/login', {message: "Incorrect Password", error: true});
            }
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
            res.redirect("/register");
        });
});
/* AUTHENTICATION ---------------------------------------------------------------------  */
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to register page.
        return res.redirect('/register');
    }
    next();
};  app.use(auth);  // Authentication Required
/* ------------------------------------------------------------------------------------ */
app.get("/home", (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1`;

    db.any(query, [req.session.user.username])
        .then((home) => {
            console.log(home);
            res.render("pages/home", {
                home,
                user_id: req.session.user.user_id,
                username: req.session.user.username, 
                img: req.session.user.img, 
                major: req.session.user.major,
                committee: req.session.user.committee,
                net_group: req.session.user.net_group,
                brother_interviews: req.session.user.brother_interviews
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.get("/calendar", (req, res) => {
    res.render("pages/calendar", {

    });
});
/* GET COMMUNITY -------------------------------------------------------------------- */
app.get("/community", (req, res) => {

    const query = `SELECT * FROM users;`;

    db.any(query)
        .then((community) => {
            req.session.save();
            console.log(community);
            res.render("pages/community", {community});
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
    
});
/* GET BRIDGE -------------------------------------------------------------------- */
app.get("/bridge", (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((bridge) => {
            req.session.save();
            console.log(bridge);
            res.render("pages/bridge", {bridge, username: req.session.user.username});
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
    
});
/* GET SUBMISSIONS -------------------------------------------------------------------- */
app.get("/submission", (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((submissions) => {
            req.session.save();
            console.log(submissions);
            res.render("pages/submission", {submissions, user_id: req.session.user.user_id});
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
    
});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile", (req, res) => {

    const user_id = parseInt(req.session.user.user_id);
    const values = [req.body.username, req.body.img, req.body.class, req.body.major, req.body.committee, user_id];

    console.log("USER_ID = " + user_id);
    const query = `
    UPDATE
        users
    SET
        username = $1,
        img = $2,
        class = $3,
        major = $4,
        committee = $5
    WHERE
        user_id = $6;`;

    db.none(query, values)
        .then((update) => {

            user.username = values[0];
            user.img = values[1];
            user.class = values[2];
            user.major = values[3];
            user.committee = values[4];

            req.session.user = user;
            req.session.save();

            console.log("\n\nSuccessful Update: \n", user);
            res.redirect("/home");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* SUBMIT BROTHER INTERVIEW --------------------------------------------------------- */
app.post("/submit_interview", (req, res) => {

    const query = `
    INSERT INTO
        brother_interviews(username, brother, family, proof)
    VALUES
        ('${req.session.user.username}', $1, $2, $3);
        
    UPDATE
        users
    SET
        brother_interviews = ${req.session.user.brother_interviews + 1};`;

    db.none(query, [req.body.brother, req.body.family, req.body.proof])
        .then((update) => {

            console.log("\nNumber of Brother Interviews = " + (user.brother_interviews + 1));

            user.brother_interviews = user.brother_interviews + 1;

            req.session.user = user;
            req.session.save();

            console.log("\n\nSuccessful Update: \n", user);
            res.redirect("/bridge");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* ------------------------------------------------------------------------------------ */
app.get("/admin", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM users ORDER BY users.user_id ASC`;

    db.any(query)
        .then((admin) => {
            console.log(admin);
            res.render("pages/admin", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/delete", (req, res) => {

    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`

    /* Execute Task */
    db.task("delete-user", (task) => {

        return task.batch([
            db.none(
                `DELETE FROM users WHERE user_id = $1 AND username = $2 AND admin = $3 AND img = $4 AND class = $5 AND major = $6 AND committee = $7 AND net_group = $8 AND preliminary_forms = $9 AND big_brother_mentor = $10 AND getting_to_know_you = $11 AND informational_interviews = $12 AND resume = $13 AND domingos = $14 AND brother_interviews = $15 AND points = $16 AND password = $17;`,
                [parseInt(req.body.user_id), req.body.username, req.body.admin, 
                    req.body.img, req.body.class, req.body.major, 
                    req.body.committee, req.body.net_group, req.body.preliminary_forms, 
                    req.body.big_brother_mentor, req.body.getting_to_know_you, req.body.informational_interviews, 
                    req.body.resume, parseInt(req.body.domingos), parseInt(req.body.brother_interviews), parseInt(req.body.points),
                    req.session.user.password]
            ), // END OF db.none
            task.any(query, [req.session.user.username])
        ]) //END OF task.batch
        
    })  // END OF db.task
    .then(([, users]) => {
        console.log("BATCH SUCCESS");
        console.info(users);
        res.redirect("/admin");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/admin");
    })
});
/* ------------------------------------------------------------------------------------ */
app.listen(3000);
console.log("Server is listening on port 3000\n\n");