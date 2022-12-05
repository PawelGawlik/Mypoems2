const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const app = express();
const mongo = require('mongodb');
const config = require('./config.js');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const index2 = require('./routes/index2.js');
const index = require('./routes/index.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.listen(process.env.PORT, () => {
    console.log("Serwer wystartował...");
})
app.set('x-powered-by', false);
app.set('trust proxy', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cookieSession({
    name: 'session',
    keys: config.keySession,
    maxAge: config.maxAgeSession
}))
app.use(cookieParser());
app.use('/', index2);
app.use('/', index);
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.redirect('/error404.html');
})
/*app.use((error, req, res, next) => {
    res.redirect('/error500.html');
})*/