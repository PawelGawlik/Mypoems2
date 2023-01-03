const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const index2 = require('./index2');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
let main = db.collection('main');
const users = db.collection('users');
router.get('/index2.html/:id?', async (req, res, next) => {
    main = db.collection(`main${req.params.id}`);
    const ip = req.ip;
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    if (!mainObjArr.length) {
        res.redirect('/index2.html/1');
        return;
    }
    if (mainObjArr[0].ips.every((el) => {
        return !(el.ip === ip);
    })) {
        mainObjArr[0].ips.push({
            ip
        });
        const { visitors } = mainObjArr[0];
        await main.updateOne({ myId: 0 }, {
            $set: {
                visitors: visitors + 1,
                ips: mainObjArr[0].ips
            }
        })
    }
    client.close();
    res.sendFile('index2.html', {
        root: './public'
    })
})
router.get('/page2.html/:id?', (req, res, next) => {
    res.sendFile('page2.html', {
        root: './public'
    })
})
router.get('/allpoems.html/:id?', (req, res) => {
    res.sendFile('allpoems.html', {
        root: './public'
    })
})
/*router.get('/admin.html/:id', (req, res, next) => {
    //main = db.collection(require('./index2').coll);
    //console.log(require('./index2').coll)
    //main = db.collection(`main${req.params.id}`);
    if (!req.session.poetry) {
        res.redirect('/error.html');
        return;
    }
    next();
})*/
router.get('/admin.html/:id?', (req, res, next) => {
    if (!req.session[`poetry${req.params.id}`]) {
        res.redirect('/error.html');
        return;
    }
    res.sendFile('admin.html', {
        root: './public'
    })
})

router.post('/log.html', async (req, res) => {
    await client.connect();
    const userArr = await users.find({
        login: req.body.login,
        password: req.body.password
    }).toArray();
    if (userArr.length) {
        req.session[`poetry${userArr[0].id}`] = 1;
        res.redirect(`/admin.html/${userArr[0].id}`);
        client.close();
        return;
    }
    client.close();
    res.redirect('/error.html');
})
router.get('/logout/:id', (req, res) => {
    req.session = null;
    res.redirect(`/index2.html/${req.params.id}`);
})
router.post('/admin.html/:id', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const poemArr = await main.find({ type: 'poem' }).toArray();
    const poemArr2 = [...poemArr];
    poemArr2.sort((param1, param2) => {
        return param1.myId - param2.myId;
    })
    let maxId;
    if (poemArr2.length) {
        maxId = poemArr2[poemArr2.length - 1].myId;
    } else {
        maxId = 0;
    }
    await main.insertOne({
        myId: maxId + 1,
        type: 'poem',
        body: {
            title: req.body.title,
            header: req.body.header,
            text: req.body.poem
        },
        likes: 0,
        commentNumber: 0,
        comments: []
    })
    if (req.body.delete) {
        const hidden = Number(req.body.hidden);
        await main.deleteOne({
            type: 'poem',
            myId: hidden
        })
        if (hidden) {
            await main.updateMany({ myId: { $gt: hidden } }, {
                $inc: {
                    myId: -1
                }
            })
            const mainObjArr = await main.find({ myId: 0 }).toArray();
            const newIpsArr = mainObjArr[0].ips.map((el) => {
                if (el.hasOwnProperty(`likeButton${hidden}`)) {
                    delete el[`likeButton${hidden}`];
                }
                let i = 1;
                while (i < 14) {
                    if (el.hasOwnProperty(`likeButton${hidden + i}`)) {
                        delete el[`likeButton${hidden + i}`];
                        el[`likeButton${hidden - 1 + i}`] = true;
                    }
                    i++;
                }
                return el;
            })
            await main.updateOne({ myId: 0 }, {
                $set: {
                    ips: newIpsArr
                }
            })
        }
    }
    res.redirect('back');
    client.close();
})
router.get('/poems/:id', async (req, res) => {
    const id = req.params.id;
    main = db.collection(`main${id}`);
    await client.connect();
    const poemArr = await main.find({ type: 'poem' }).toArray();
    poemArr.sort((param1, param2) => {
        return param1.myId - param2.myId;
    })
    res.json(poemArr);
    client.close();
})
router.get('/poem/:id/:id2', async (req, res) => {
    const id = req.params.id;
    main = db.collection(`main${id}`);
    await client.connect();
    const id2 = Number(req.params.id2);
    const poem = await main.find({ myId: id2 }).toArray();
    res.json(poem[0]);
    client.close();
})
router.get('/poem.html/:id/:id2', (req, res) => {
    res.sendFile('poem.html', {
        root: './public'
    })
})
router.post('/comment/:id/:id2', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const id2 = parseInt(req.params.id2);
    const poemArr = await main.find({ myId: id2 }).toArray();
    const { nick, comment } = req.body;
    poemArr[0].comments.push({
        nick,
        comment,
        display: 3,
        date: new Date().toLocaleDateString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })
    const { comments } = poemArr[0];
    await main.updateOne({ myId: id2 }, {
        $set: {
            comments,
            commentNumber: comments.length
        }
    });
    res.redirect('back');
    client.close();
})
router.get('/likes/:id/:id2', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const id2 = parseInt(req.params.id2);
    const poemArr = await main.find({ myId: id2 }).toArray();
    const { likes } = poemArr[0];
    await main.updateOne({ myId: id2 }, {
        $set: {
            likes: likes + 1
        }
    })
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const userArr = mainObjArr[0].ips.map((el) => {
        if (el.ip === req.ip) {
            const likeButton = `likeButton${id2}`
            el[likeButton] = true;
        }
        return el;
    })
    await main.updateOne({ myId: 0 }, {
        $set: {
            ips: userArr
        }
    })
    res.json(poemArr[0]);
    client.close();
})
router.delete('/comment/:id', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const body = req.body;
    const poem = await main.find({ myId: body.id }).toArray();
    const newArr = poem[0].comments.filter((el) => {
        return el.comment !== body.comment;
    })
    await main.updateOne({ myId: body.id }, {
        $set: {
            comments: newArr,
            commentNumber: newArr.length
        }
    })
    res.json(poem[0]);
    client.close();
})
router.post('/commentDisplay/:id', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const body = req.body;
    const poem = await main.find({ myId: body.id }).toArray();
    const newArr = poem[0].comments.filter((el) => {
        if (el.comment === body.comment) {
            el.display--;
        }
        return true;
    })
    await main.updateOne({ myId: body.id }, {
        $set: {
            comments: newArr
        }
    })
    res.json(poem[0]);
    client.close();
})
router.get('/buttonDisplay/:id/:id2', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    const id2 = parseInt(req.params.id2);
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const userArr = mainObjArr[0].ips.filter((el) => {
        return el.ip === req.ip;
    })
    const likeButton = userArr[0].hasOwnProperty(`likeButton${id2}`);
    res.json({ likeButton });
    client.close();
})
router.get('/visits/:id', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const { visitors } = mainObjArr[0];
    res.json({ visitors });
    client.close();
})
router.post('/remake/:id', async (req, res) => {
    main = db.collection(`main${req.params.id}`);
    await client.connect();
    const poemArr = await main.find({ myId: Number(req.body.class) }).toArray();
    const poem = poemArr[0];
    res.json(poem);
    client.close();
})
router.delete('/delete/:id2', async (req, res) => {
    main = db.collection(`main${req.params.id2}`);
    const id = Number(req.body.class);
    await client.connect();
    await main.deleteOne({ myId: id });
    await main.updateMany({ myId: { $gt: id } }, {
        $inc: {
            myId: -1
        }
    })
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const newIpsArr = mainObjArr[0].ips.map((el) => {
        if (el.hasOwnProperty(`likeButton${id}`)) {
            delete el[`likeButton${id}`];
        }
        let i = 1;
        while (i < 14) {
            if (el.hasOwnProperty(`likeButton${id + i}`)) {
                delete el[`likeButton${id + i}`];
                el[`likeButton${id - 1 + i}`] = true;
            }
            i++;
        }
        return el;
    })
    await main.updateOne({ myId: 0 }, {
        $set: {
            ips: newIpsArr
        }
    })
    res.json();
    client.close();
})
router.post('/change/:id2', async (req, res) => {
    main = db.collection(`main${req.params.id2}`);
    const id = Number(req.body.class);
    const newId = Number(req.body.newMyId);
    await client.connect();
    const obj = await main.findOne({ myId: id })
    if (id > newId) {
        await main.updateMany({
            myId: { $gte: newId, $lt: id },
            type: 'poem'
        }, {
            $inc: {
                myId: 1
            }
        })
        const mainObjArr = await main.find({ myId: 0 }).toArray();
        const newIpsArr = mainObjArr[0].ips.map((el) => {
            if (el.hasOwnProperty(`likeButton${id}`)) {
                delete el[`likeButton${id}`];
                el[`likeButton2${newId}`] = true;
            }
            let i = newId;
            while (i < id) {
                if (el.hasOwnProperty(`likeButton${i}`)) {
                    delete el[`likeButton${i}`];
                    el[`likeButton2${i + 1}`] = true;
                }
                i++;
            }
            for (i = 1; i < 15; i++) {
                if (el.hasOwnProperty(`likeButton2${i}`)) {
                    delete el[`likeButton2${i}`];
                    el[`likeButton${i}`] = true;
                }
            }
            return el;
        })
        await main.updateOne({ myId: 0 }, {
            $set: {
                ips: newIpsArr
            }
        })
    } else if (id < newId) {
        await main.updateMany({
            myId: { $gt: id, $lte: newId },
            type: 'poem'
        }, {
            $inc: {
                myId: -1
            }
        })
        const mainObjArr = await main.find({ myId: 0 }).toArray();
        const newIpsArr = mainObjArr[0].ips.map((el) => {
            if (el.hasOwnProperty(`likeButton${id}`)) {
                delete el[`likeButton${id}`];
                el[`likeButton2${newId}`] = true;
            }
            let i = newId;
            while (i > id) {
                if (el.hasOwnProperty(`likeButton${i}`)) {
                    delete el[`likeButton${i}`];
                    el[`likeButton2${i - 1}`] = true;
                }
                i--;
            }
            for (i = 1; i < 15; i++) {
                if (el.hasOwnProperty(`likeButton2${i}`)) {
                    delete el[`likeButton2${i}`];
                    el[`likeButton${i}`] = true;
                }
            }
            return el;
        })
        await main.updateOne({ myId: 0 }, {
            $set: {
                ips: newIpsArr
            }
        })
    }
    await main.updateOne(obj, {
        $set: {
            myId: newId
        }
    })
    res.json();
    client.close();
})
module.exports = router;