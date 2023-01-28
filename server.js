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

/* FILE UPLOAD NPM EXTENSION */
const multer = require('multer');
const upload = multer({storage:multer.memoryStorage()});

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
    name:undefined,
    admin:undefined,
    class:undefined,
    major:undefined,
    committee:undefined,
    net_group:undefined,
    bio:undefined,
    email:undefined,
    linkedin:undefined,
    spotify:undefined,
    phone:undefined,
    preliminary_forms:undefined,
    big_brother_mentor:undefined,
    getting_to_know_you:undefined,
    informational_interviews:undefined,
    resume:undefined,
    domingos: undefined,
    brother_interviews:undefined,
    points:undefined,
    imgHERE:undefined
}

/* ADMIN */
const admin = {
    edit_id:undefined
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
    const query = `
    INSERT INTO
        users(username, password, name, admin, class, major, committee, net_group, preliminary_forms, big_brother_mentor, getting_to_know_you, informational_interviews, resume, domingos, brother_interviews, points, imgHERE)
    VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`;

    db.none(query, [req.body.username, hash, req.body.username, 'false', '', '', '', '', 'false', 'false', 'false', 'false', '', 0, 0, 0, ''])
        .then((data) => {
            req.session.user = {
                username:req.body.username,
                password:hash,
                name:req.body.username,
                admin:'false',
                class:'',
                major:'',
                committee:'',
                net_group:'',
                bio:'',
                preliminary_forms:'false',
                big_brother_mentor:'false',
                getting_to_know_you:'false',
                informational_interviews:'false',
                resume:'',
                domingos: 0,
                brother_interviews: 0,
                points: 0,
                imgHERE:undefined
            }

            req.session.admin = {
                edit_id:undefined
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

            console.log("Logged in with USER_ID: " + client.user_id);

            if (match) {
                req.session.user = {
                    user_id: client.user_id,
                    username: req.body.username,
                    password: hash,
                    name: client.name,
                    admin: client.admin,
                    class: client.class,
                    major: client.major,
                    committee: client.committee,
                    net_group: client.net_group,
                    bio: client.bio,
                    preliminary_forms: client.preliminary_forms,
                    big_brother_mentor: client.big_brother_mentor,
                    getting_to_know_you: client.getting_to_know_you,
                    informational_interviews: client.informational_interviews,
                    resume: client.resume,
                    domingos: client.domingos,
                    brother_interviews: client.brother_interviews,
                    points: client.points,
                    imgHERE: client.imgHERE
                }

                req.session.admin = {
                    edit_id:undefined
                }
                
                req.session.save();

                console.log("Stored USER_ID: " + req.session.user.user_id);

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

    const user_id = req.session.user.user_id;
    console.log("HOME USER_ID: " + user_id);
    const query = `SELECT * FROM announcements ORDER BY announcement_id DESC LIMIT 10;`;

    db.any(query)
        .then((home) => {
            //console.log(home);
            res.render("pages/home", {
                home
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.get("/profile", (req, res) => {

    const user_id = req.session.user.user_id;
    console.log("HOME USER_ID: " + user_id);
    const query = `SELECT * FROM users WHERE user_id = ${user_id}`;

    db.any(query)
        .then((profile) => {
            console.log(profile);
            res.render("pages/profile", {
                profile,
                name: req.session.user.name,
                username: req.session.user.username, 
                major: req.session.user.major,
                bio: req.session.user.bio,
                committee: req.session.user.committee,
                net_group: req.session.user.net_group,
                brother_interviews: req.session.user.brother_interviews,
                linkedin: req.session.user.linkedin,
                spotify: req.session.user.spotify,
                imgHERE: req.session.user.imgHERE
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.get("/update_profile", (req, res) => {

    const query = `SELECT * FROM users WHERE user_id = ${req.session.user.user_id}`;

    db.any(query)
        .then((profile) => {
            //console.log(home);
            res.render("pages/update_profile", {
                profile,
                username: req.session.user.username,
                imgHERE: req.session.user.imgHERE
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile/basic", (req, res) => {

    const values = [req.body.class, req.body.major, req.body.committee, req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        class = $1,
        major = $2,
        committee = $3
    WHERE
        user_id = $4;`;

    db.none(query, values)
        .then((update) => {

            req.session.user.class = values[0];
            req.session.user.major = values[1];
            req.session.user.committee = values[2];
            req.session.save();

            console.log("\n\nSuccessful Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE PICTURE -------------------------------------------------------------------- */
app.post("/update_profile/picture", upload.single('profile_img') ,(req, res) => {   /* UPLOAD PARAMETER ALLOWS FOR DATABASE UPLOAD */

    const values = [req.file.buffer.toString('base64'), req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        imgHERE = $1
    WHERE
        user_id = $2;`;

    db.none(query, values)
        .then((update) => {

            req.session.user.imgHERE = values[0];
            req.session.save();

            console.log("\n\nSuccessful Profile Picture Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile/contact", (req, res) => {

    const values = [req.body.email, req.body.linkedin, req.body.spotify, req.body.phone, req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        email = $1,
        linkedin = $2,
        spotify = $3,
        phone = $4
    WHERE
        user_id = $5;`;

    db.none(query, values)
        .then((update) => {

            req.session.user.email = values[0];
            req.session.user.linkedin = values[1];
            req.session.user.spotify = values[2];
            req.session.user.phone = values[3];
            req.session.save();

            console.log("\n\nSuccessful Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile/bio", (req, res) => {

    const values = [req.body.bio, req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        bio = $1
    WHERE
        user_id = $2;`;

    db.none(query, values)
        .then((update) => {

            req.session.user.bio = values[0];
            req.session.save();

            console.log("\n\nSuccessful Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE HOBBY 1 -------------------------------------------------------------------- */
app.post("/update_profile/hobby1", upload.single('h1_img') ,(req, res) => {   /* UPLOAD PARAMETER ALLOWS FOR DATABASE UPLOAD */

    const values = [req.body.hobby1, req.body.h1_img,req.file.buffer.toString('base64'), req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        hobby1 = $1,
        h1_caption = $2,
        h1_img = $3
    WHERE
        user_id = $4;`;

    db.none(query, values)
        .then((update) => {

            req.session.save();

            console.log("\n\nSuccessful Profile Picture Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE HOBBY 2 -------------------------------------------------------------------- */
app.post("/update_profile/hobby2", upload.single('h2_img') ,(req, res) => {   /* UPLOAD PARAMETER ALLOWS FOR DATABASE UPLOAD */

    const values = [req.body.hobby2, req.body.h2_img, req.file.buffer.toString('base64'), req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        hobby2 = $1,
        h2_caption = $2,
        h2_img = $3
    WHERE
        user_id = $4;`;

    db.none(query, values)
        .then((update) => {

            req.session.save();

            console.log("\n\nSuccessful Profile Picture Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE HOBBY 2 -------------------------------------------------------------------- */
app.post("/update_profile/background", (req, res) => {   /* UPLOAD PARAMETER ALLOWS FOR DATABASE UPLOAD */

    const values = [req.body.background, req.session.user.user_id];

    console.log("USER_ID = " + req.session.user.user_id);
    const query = `
    UPDATE
        users
    SET
        background = $1
    WHERE
        user_id = $2;`;

    db.none(query, values)
        .then((update) => {

            req.session.save();

            console.log("\n\nSuccessful Profile Picture Update: \n", req.session.user);
            res.redirect("/update_profile");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile/basic-admin", (req, res) => {

    const edit_id = parseInt(req.body.edit_id);
    const values = [req.body.class, req.body.major, req.body.committee, edit_id];

    console.log("USER_ID = " + req.body.edit_id);
    const query = `
    UPDATE
        users
    SET
        class = $1,
        major = $2,
        committee = $3
    WHERE
        user_id = $4;`;

    db.none(query, values)
        .then((update) => {

            req.session.save();

            console.log("\n\nSuccessful Update: \n", req.session.user);
            res.redirect("/admin/edit_user");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE PICTURE -------------------------------------------------------------------- */
app.post("/update_profile/picture-admin", upload.single('profile_img') ,(req, res) => {   /* UPLOAD PARAMETER ALLOWS FOR DATABASE UPLOAD */

    const edit_id = parseInt(req.body.edit_id);
    const values = [req.file.buffer.toString('base64'), edit_id];

    console.log("USER_ID = " + req.body.edit_id);
    const query = `
    UPDATE
        users
    SET
        imgHERE = $1
    WHERE
        user_id = $2;`;

    db.none(query, values)
        .then((update) => {

            req.session.save();

            console.log("\n\nSuccessful Profile Picture Update: \n", req.session.user);
            res.redirect("/admin/edit_user");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE PROFILE -------------------------------------------------------------------- */
app.post("/update_profile/contact-admin", (req, res) => {

    const edit_id = parseInt(req.body.edit_id);
    const values = [req.body.email, req.body.linkedin, req.body.phone, edit_id];

    console.log("USER_ID = " + edit_id);
    const query = `
    UPDATE
        users
    SET
        email = $1,
        linkedin = $2,
        phone = $3
    WHERE
        user_id = $4;`;

    db.none(query, values)
        .then((update) => {

            req.session.user.email = values[0];
            req.session.user.linkedin = values[1];
            req.session.user.phone = values[2];
            req.session.save();

            console.log("\n\nSuccessful Update: \n", req.session.user);
            res.redirect("/admin/edit_user");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* UPDATE USER DATABASE POST INTERVIEW SUBMISSION --------------------------------------------------------- */
app.post("/update_users", (req, res) => {

    const values = [req.session.user.brother_interviews, req.session.user.imgHERE, req.session.user.points];
    const query = `
    UPDATE
        users
    SET
        brother_interviews = $1,
        imgHERE = $2,
        points = $3
    WHERE
        user_id = ${req.session.user.user_id};`;

    db.none(query, values)
        .then((update) => {

            req.session.user.brother_interviews = values[0];
            req.session.user.imgHERE = values[1];

            req.session.save();

            console.log("\n\nSuccessful User Update: \n");
            res.redirect("/profile");
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
            console.log("COMMUNITY: \n");
            console.log(community);
            res.render("pages/community", {community});
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
    
});
/* GET BRIDGE -------------------------------------------------------------------- */
app.get("/bridge", (req, res) => {

    const query = `SELECT * FROM users WHERE user_id = ${req.session.user.user_id};`;

    db.any(query)
        .then((bridge) => {
            req.session.save();
            console.log(bridge);
            res.render("pages/bridge", {
                bridge, 
                user_id: req.session.user.user_id
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
    
});
/* SUBMIT_INTERVIEW PAGE --------------------------------------------------------- */
app.get("/submit_interview", (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((bridge) => {

            req.session.save();

            res.render("pages/submit_interview", {
                bridge, 
                username: req.session.user.username
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* SUBMIT_INTERVIEW PAGE -------------------------------------------------------- */
app.get("/submit_networking", (req, res) => {

    const query = `SELECT * FROM users WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((bridge) => {

            req.session.user.points = req.session.user.points + 2;
            req.session.save();

            res.render("pages/submit_networking", {
                bridge, 
                username: req.session.user.username
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* GET INTERVIEWS -------------------------------------------------------------------- */
app.get("/interviews", (req, res) => {

    const query = `SELECT * FROM brother_interviews WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((brothers) => {

            req.session.save();

            res.render("pages/interviews", {
                brothers, 
                username: req.session.user.username
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* SUBMIT BROTHER INTERVIEW ---------------- */
app.post("/submit_interview/post", upload.single('proof'), (req, res) => {

    const query = `
    INSERT INTO
        brother_interviews(username, brother, family, proof)
    VALUES
        ('${req.session.user.username}', $1, $2, $3);`;

    db.none(query, [req.body.brother, req.body.family, req.file.buffer.toString('base64')])
        .then((update) => {

            /* INDICATE SESSION INCRIMENT -- Updated later -> /update_users */
            req.session.user.brother_interviews = req.session.user.brother_interviews + 1;
            req.session.user.points = req.session.user.points + 2;
            req.session.save();

            console.log("\n\nSuccessful Interview Submission: \n");

            res.redirect("/interviews");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* GET BRIDGE -------------------------------------------------------------------- */
app.get("/networking", (req, res) => {

    const query = `SELECT * FROM networking_groups WHERE username = $1;`;

    db.any(query, [req.session.user.username])
        .then((net_groups) => {
            
            req.session.save();

            res.render("pages/networking", {
                net_groups, 
                username: req.session.user.username
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* SUBMIT NETWORKING GROUP ---------------- */
app.post("/submit_networking/post", upload.single('proof'), (req, res) => {

    const query = `
    INSERT INTO
        networking_groups(username, group_week, proof)
    VALUES
        ('${req.session.user.username}', $1, $2);`;

    db.none(query, [req.body.group_week, req.file.buffer.toString('base64')])
        .then((update) => {

            req.session.user.points = req.session.user.points + 2;
            req.session.save();

            console.log("\n\nSuccessful Networking Group Submission: \n");
            res.redirect("/networking");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* GET RANKING -------------------------------------------------------------------- */
app.get("/ranking", (req, res) => {

    const query = `SELECT * FROM users ORDER BY points DESC;`;

    db.any(query)
        .then((ranking) => {

            req.session.save();

            res.render("pages/ranking", {ranking});
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
    
    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/admin", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/post_announcement", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/post_announcement", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/announcements", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM announcements ORDER BY announcement_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/announcements", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/delete-announcement", (req, res) => {

    const query = `SELECT * FROM announcements ORDER BY announcement_id ASC;`

    /* Execute Task */
    db.task("delete-user", (task) => {

        return task.batch([
            db.none(
                `DELETE FROM announcements WHERE announcement_id = $1;`,
                [parseInt(req.body.announcement_id)]
            ), // END OF db.none
            task.any(query, [req.session.user.username])
        ]) //END OF task.batch
    })  // END OF db.task
    .then(([, users]) => {
        console.log("ADMIN:  BATCH SUCCESS\n\n");
        //console.info(users);
        res.redirect("/admin/announcements");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/admin");
    })
});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/management", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/management", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/delete-user", (req, res) => {

    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`

    /* Execute Task */
    db.task("delete-user", (task) => {

        return task.batch([
            db.none(
                `DELETE FROM users WHERE user_id = $1;`,
                [parseInt(req.body.user_id)]
            ), // END OF db.none
            task.any(query, [req.session.user.username])
        ]) //END OF task.batch
    })  // END OF db.task
    .then(([, users]) => {
        console.log("ADMIN:  BATCH SUCCESS\n\n");
        //console.info(users);
        res.redirect("/admin/management");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/admin");
    })
});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/interview", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM brother_interviews ORDER BY interview_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/interview", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/delete-interview", (req, res) => {

    const query = `SELECT * FROM users ORDER BY users.user_id ASC;`

    /* Execute Task */
    db.task("delete-user", (task) => {

        return task.batch([
            db.none(
                `DELETE FROM brother_interviews WHERE interview_id = $1;`,
                [parseInt(req.body.interview_id)]
            ), // END OF db.none
            task.any(query, [req.session.user.username])
        ]) //END OF task.batch
    })  // END OF db.task
    .then(([, users]) => {
        console.log("ADMIN:  BATCH SUCCESS\n\n");
        //console.info(users);
        res.redirect("/admin/interview");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/admin");
    })
});
/* SUBMIT ANNOUNCEMENT ---------------- */
app.post("/admin/post_announcement", (req, res) => {

    const query = `
    INSERT INTO
        announcements(time, username, subject, announcement, imgHERE)
    VALUES
        ($1, '${req.session.user.username}', $2, $3, '${req.session.user.imgHERE}');`;

    db.none(query, [req.body.time, req.body.subject, req.body.announcement])
        .then((announcement) => {

            console.log("\n\nSuccessful Announcement \n");
            res.redirect("/home");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })

});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/networking", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }
    
    const query = `SELECT * FROM networking_groups ORDER BY net_id ASC;`;

    db.any(query)
        .then((admin) => {
            
            res.render("pages/admin/networking", {
                admin: admin,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/delete-networking", (req, res) => {

    const query = `SELECT * FROM networking_groups ORDER BY net_id ASC;`

    /* Execute Task */
    db.task("delete-user", (task) => {

        return task.batch([
            db.none(
                `DELETE FROM networking_groups WHERE net_id = $1;`,
                [parseInt(req.body.net_id)]
            ), // END OF db.none
            task.any(query, [req.session.user.username])
        ]) //END OF task.batch
    })  // END OF db.task
    .then(([, users]) => {
        console.log("ADMIN:  BATCH SUCCESS\n\n");
        //console.info(users);
        res.redirect("/admin/networking");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/admin");
    })
});
/* ------------------------------------------------------------------------------------ */
app.get("/admin/edit_user", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }

    const query = `SELECT * FROM users WHERE user_id = '${req.session.admin.edit_id}';`;

    db.any(query)
        .then((admin) => {
            console.log(admin);
            res.render("pages/admin/edit_user", {
                admin: admin,
            });
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.post("/admin/edit_user/post", (req, res) => {

    if(req.session.user.admin === 'false') {
        res.redirect("pages/home");
    }

    const query = `INSERT INTO admin(edit_id) VALUES ('${req.body.user_id}');`;

    db.any(query)
        .then((rows) => {
            
            req.session.admin.edit_id = req.body.user_id;
            req.session.save();

            res.redirect("/admin/edit_user");
        })
        .catch((error) => {
            console.log("\n\nERROR: ", error.message || error);
        })
});
/* ------------------------------------------------------------------------------------ */
app.listen(3000);
console.log("Server is listening on port 3000\n\n");