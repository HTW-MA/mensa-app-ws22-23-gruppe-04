const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
var webPush = require('web-push');
const mysql = require('mysql');
require('dotenv').config();

const app = express();

const db = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
});

const origin = process.env.REACT_APP_DATABASE_LOCATION || "https://mensaspot.netlify.app";

app.use(cors({
    origin: [origin],
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: "userId",
    secret: "important",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 3600000,
    },
    })
);

//encrypting and decrypting of push messages
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY)
{
    console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
        "environment variables. You can use the following ones:");
    console.log(webPush.generateVAPIDKeys());
}

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
    'https://serviceworke.rs/',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

app.get("/vapidPublicKey", (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
});


const rebuildSubscription = (endpoint, expTime, p256dh, auth) => {

    console.log("RebuildSubscription Endpoint: " + endpoint);
    console.log("RebuildSubscription expTime: " + expTime);
    console.log("RebuildSubscription p256dh: " + p256dh);
    console.log("RebuildSubscription auth: " + auth);

    let rebuild = {"subscription": {
            "endpoint":endpoint,
            "expirationTime":expTime,
            "keys": {
                    "p256dh":p256dh,
                    "auth":auth
            }
        }
    };

    console.log("\n======================[Rebuild]======================\n")
    console.log("Rebuild: " + JSON.stringify(rebuild));

    let endpoint2 = JSON.stringify(rebuild.subscription.endpoint).replaceAll("\"", "");
    console.log("Endpoint: " + endpoint2);

    let expTime2 = JSON.stringify(rebuild.subscription.expirationTime).replaceAll("\"", "");
    console.log("Expiration Time: " + expTime2);

    let p256dh2 = JSON.stringify(rebuild.subscription.keys.p256dh).replaceAll("\"", "");
    console.log("p256dh: " + p256dh2);

    let auth2 = JSON.stringify(rebuild.subscription.keys.auth).replaceAll("\"", "");
    console.log("Auth: " + auth2);

    return rebuild;
}


const saveSubscription = (endpoint, expTime, p256dh, auth, userId) => {

    const sql = `UPDATE users SET endpoint = ?, expirationTime = ?, p256dh = ?, auth = ? WHERE userId = ?`;

    db.query(sql, [endpoint, expTime, p256dh, auth, userId], (err, result) => {
        console.log("Sucessfully saved subscription!");
        if (err) console.log(err);
    });
    rebuildSubscription(endpoint, expTime, p256dh, auth);
}

//new registered account is pushed to the DB
app.post("/register", (req, res) => {

    const subscription = req.body.subscription;
    const userId = req.body.userId;

    res.sendStatus(201);

    console.log("UserId: " + userId);
    console.log("Whole Subscription: " + JSON.stringify(subscription));
    console.log("Whole Subscription: " + JSON.stringify(req.body));
    console.log("Subscription: " + JSON.stringify(subscription));

    let endpoint = JSON.stringify(subscription.endpoint).replaceAll("\"", "");
    console.log("Endpoint: " + endpoint);

    let expTime = JSON.stringify(subscription.expirationTime).replaceAll("\"", "");
    console.log("Expiration Time: " + expTime);
    if(expTime == "null") { expTime = null; }

    let p256dh = JSON.stringify(subscription.keys.p256dh).replaceAll("\"", "");
    console.log("p256dh: " + p256dh);

    let auth = JSON.stringify(subscription.keys.auth).replaceAll("\"", "");
    console.log("Auth: " + auth);

    console.log("Register: userId: " + userId);
    saveSubscription(endpoint, expTime, p256dh, auth, userId);

});

//insert canteens from OpenMensa DB to own DB
//only used once due to rare updates of canteens
app.post('/api/insert', (req, res) => {

    const id = req.body.id;
    const name = req.body.name;
    const city = req.body.city;
    const address = req.body.address;
    const lat = req.body.lat;
    const lng = req.body.lng;
    console.log("Type: " + typeof lat)
    const sql = `INSERT INTO canteens (id, name, city, address, lat, lng) VALUES (?,?,?,?,?,?)`;
    db.query(sql, [id, name, city, address, lat, lng], (err, result) => {

        if (err) {
            console.log(err);
        }
        else {
            res.send("Sucessfully inserted canteen "+ id + "!")
            console.log("Sucessfully inserted canteen "+ id + "!");
        }

        console.log("Result: " + result);
    });
});


app.get("/getSubscription/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `SELECT * FROM users WHERE userId = ?`;

    db.query(sql, [userId], (err, result) => {

        if(err) {
            console.log("/getSubscription/:userId Exception: " + err);
            res.sendStatus(500);
        }

        console.log("getSubscription Raw Result: " + result);
        console.log("getSubscription Result: " + JSON.stringify(result));
        console.log("getSubscription Endpoint: " + result[0].endpoint);
        const rebuild = rebuildSubscription(JSON.stringify(result[0].endpoint), JSON.stringify(result[0].expirationTime), JSON.stringify(result[0].p256dh), JSON.stringify(result[0].auth));
        console.log("getSubscription Rebuild: " + JSON.stringify(rebuild));
        console.log();
        res.send(result);
    });
});

//get canteens from own DB
app.get("/getCanteens", (req, res) => {

    const sql = `SELECT * FROM canteens`;

    db.query(sql, (err, result) => {
        res.send(result);
    });
});


app.post('/api/signup', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    const sql = `INSERT INTO users (username, password, role) VALUES (?,?,?)`;
    try {
        db.query(sql, [username, password, role], (err, result) => {

            if (err) {
                console.log(err);
                if(err.sqlMessage.includes("Duplicate"))
                {
                    res.send({ msg: err.sqlMessage, loggedIn: false });
                }
            }
            else {
                console.log("Sucessfully inserted new user!");
                res.send({ msg: "Signed up successfully!", loggedIn: true});
            }
        });
    } catch (e) {
        console.log(e);
    }
});


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {

            if(err) { console.log }

            if(typeof result != undefined && result.length > 0) {
                if(password === result[0].password) {
                    req.session.user = result;
                    req.session.user[0].password = "?";
                    loggedIn = true;
                    res.send({ msg: "Logged in successfully!", loggedIn: true, user: req.session.user[0] });
                } else {
                    res.send({ msg: "Wrong username/password combination!"});
                }
            } else {
                res.send({ msg: "Wrong username/password combination!"});
            }
        }
    );
});

app.get("/login", (req, res) => {
    if(req.session.user) {
        loggedIn = true;
        res.send({ loggedIn: true, user: req.session.user[0] });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/logout", (req, res) => {
    delete req.session.user;
    loggedIn = false;
    res.send("Logout");
});


app.delete('/api/delete/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    const sql = `DELETE FROM articles WHERE articleId = ?`;

    db.query(sql, articleId, (err, result) => {
        console.log("Sucessfully deleted!");
        console.log(result);

        if (err) console.log(err);
    });
});

app.put('/api/updateUser', async (req, res) => {
    const user = req.body.user;

    const sql = `UPDATE users SET favoriteCanteen = ?, favoriteMeal = ?, preferedFood = ?, allergics = ? WHERE userId = ?`;

    db.query(sql, [user.favoriteCanteen, user.favoriteMeal, user.preferedFood, user.allergics, user.userId], (err, result) => {
        console.log("Sucessfully updated user!");
        if (err) console.log(err);
    });
});


app.listen(process.env.PORT || 5000, () => {
    console.log("Origin: " + origin);
    console.log(`Running on port ${process.env.PORT}...`);
});
