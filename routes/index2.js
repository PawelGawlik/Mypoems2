const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
const users = db.collection('users');
router.post('/reg', async (req, res) => {
    await client.connect();
    const userArray = await users.find({
        login: req.body.log,
        password: req.body.pwd
    }).toArray();
    if (userArray.length) {
        console.log("błąd")
    } else {
        const usersNum = await users.find().toArray();
        await users.insertOne({
            id: usersNum.length + 1,
            poet: req.body.poet,
            login: req.body.log,
            password: req.body.pwd,
            mail: req.body.mail,
            coll: `main${usersNum.length + 1}`
        })
        const main = db.collection(`main${usersNum.length + 1}`);
        await main.insertOne({
            myId: 0,
            visitors: 0,
            ips: []
        })
        config.keySession.push(`poetry${usersNum.length + 1}`);
    }
    res.redirect('/log.html');
    client.close();
})
/*router.post('/log.html', (req, res) => {
    if (req.body.login === config.login && req.body.password === config.password) {
        coll = 'main1';
        req.session.poetry = 1;
        res.redirect('/admin.html');
        return;
    }
    res.redirect('/error.html');
})*/
module.exports = router;
