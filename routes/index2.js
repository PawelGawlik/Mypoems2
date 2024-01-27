const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
const users = db.collection('users');
const counter = db.collection('counter');
let accountArr = [];
router.get('/', async (req, res, next) => {
    if (!req.secure) {
        res.redirect(`https://${req.hostname}/`);
        return;
    }
    next();
})
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
        const usersArr = await users.find().toArray();
        let maxId;
        if (usersArr.length) {
            maxId = usersArr[usersArr.length - 1].id;
        } else {
            maxId = 0;
        }
        await users.insertOne({
            id: maxId + 1,
            poet: req.body.poet,
            login: req.body.log,
            password: req.body.pwd,
            mail: req.body.mail,
            coll: `main${maxId + 1}`
        })
        const main = db.collection(`main${maxId + 1}`);
        await main.insertOne({
            myId: 0,
            visitors: 0,
            ips: []
        })
        config.keySession.push(`poetry${maxId + 1}`);
    }
    res.redirect('/log.html');
    client.close();
})
let poetsArr2 = [];
router.post('/search', async (req, res) => {
    const reg = new RegExp(`^${req.body.trim()}`, 'i');
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
    const poetArr2 = poetArr.map((el) => {
        return {
            id: el.id,
            poet: el.poet
        }
    })
    res.json(poetArr2);
})
router.get('/users', async (req, res) => {
    await client.connect();
    const poetsArr = await users.find().toArray();
    const poetsIdArr = poetsArr.map((el) => {
        return el.id;
    });
    client.close();
    res.json(poetsIdArr);
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
    if (req.get('Referer') !== `http://${req.hostname}/account.html`) {
        accountArr = [];
    }
    res.json(accountArr);
})
router.get('/account.html', async (req, res, next) => {
    if (req.get('Referer') !== `http://${req.hostname}/`) {
        accountArr = [];
    }
    next();
})
router.get('/accDel5Tj81uuRW/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (req.get('Referer') !== `http://${req.hostname}/admin.html/${id}`) {
        res.json('Nie można usunąć konta!!!');
        return;
    }
    await client.connect();
    await users.deleteOne({ id });
    const main = db.collection(`main${id}`);
    await main.drop();
    client.close();
    res.json('Konto usunięte!!!');
})
module.exports = router;
