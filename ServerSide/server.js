
const webPush = require('web-push');
require('dotenv').config();

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
        "environment variables. You can use the following ones:");
    console.log(webPush.generateVAPIDKeys());
    return;
}

webPush.setVapidDetails(
    'https://serviceworke.rs/',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports = function(app, route)
{
    app.get(route + 'vapidPublicKey', function(req, res) {
        res.send(process.env.VAPID_PUBLIC_KEY);
    });

    app.post(route + 'register', function(req, res) {
        res.sendStatus(201);
    });
};
