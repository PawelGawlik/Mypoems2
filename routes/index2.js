const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
const users = db.collection('users');
const counter = db.collection('counter');
let accountArr = [];
/*router.get('/', async (req, res, next) => {
    if (!req.secure) {
        res.redirect(`https://${req.hostname}/`);
        return;
    }
    next();
})*/
router.post('/reg', async (req, res) => {
    await client.connect();
    const userArray = await users.find({
        login: req.body.log,
        password: req.body.pwd
    }).toArray();
    if (userArray.length) {
        await client.close();
        res.redirect('/regerror.html');
        return;
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
let poetsArr2 = [];
router.post('/search', async (req, res) => {
    const reg = new RegExp(req.body.search.trim(), 'i');
    await client.connect();
    const poetsArr = await users.find().toArray();
    poetsArr2 = poetsArr.filter((el) => {
        return reg.test(el.poet);
    })
    res.redirect('back');
    client.close();
})
router.get('/search', (req, res) => {
    res.json(poetsArr2);
})
router.get('/page/:id', async (req, res) => {
    await client.connect();
    const poetArr = await users.find({ id: Number(req.params.id) }).toArray();
    client.close();
    res.json(poetArr);
})
router.get('/users', async (req, res) => {
    await client.connect();
    const poetsArr = await users.find().toArray();
    const poets = poetsArr.length;
    client.close();
    res.json(poets);
})
router.post('/mypwd', async (req, res) => {
    await client.connect();
    if (req.body.mymail !== "") {
        accountArr = await users.find({ mail: req.body.mymail }).toArray();
    }
    client.close();
    if (req.body.mymail === "") {
        accountArr = [];
    }
    res.redirect('/account.html');
})
router.get('/mypwd', async (req, res) => {
    res.json(accountArr);
})
router.get('/account.html', async (req, res, next) => {
    if (req.get('Referer') !== '/mypwd') {
        accountArr = [];
    }
    next();
})
module.exports = router;
