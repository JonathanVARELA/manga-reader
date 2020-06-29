const scrapper = require('./scrapper.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const helmet = require('helmet');

if (process.env.MODE !== 'prod') {
    require('dotenv').config();
}

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WHITE_LIST);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

//pre-flight requests
app.options('*', function(req, res) {
    res.send(200);
});

app.get('/images', async (req, res) => {
    const url = req.query.url;
    if (url === undefined) {
        res.status(400);
        res.json({error: 400, message: 'url parameter is missing'});
        res.end();
    } else {
        try {
            const chapter = await scrapper.getChapterFromUrl(url);
            res.status(200);
            res.json(chapter);
            res.end();
        } catch (e) {
            res.status(500);
            res.json({error:500, message:e.message})
            res.end();
        }
    }
});

app.get('/next/images', async (req, res) => {
    const url = req.query.url;
    if (url === undefined) {
        res.status(400);
        res.json({error: 400, message: 'url parameter is missing'});
        res.end();
    } else {
        try {
            const chapter = await scrapper.getNextChapterFromUrl(url);
            res.status(200);
            res.json(chapter);
            res.end();
        } catch (e) {
            res.status(500);
            res.json({error:500, message:e.message})
            res.end();
        }
    }
});

app.get('/next/available', async (req, res) => {
    const url = req.query.url;
    if (url === undefined) {
        res.status(400);
        res.json({error: 400, message: 'url parameter is missing'});
        res.end();
    } else {
        try {
            const available = await scrapper.hasNextChapterFromUrl(url);
            res.status(200);
            res.json(available);
            res.end();
        } catch (e) {
            res.status(500);
            res.json({error:500, message:e.message})
            res.end();
        }
    }
});

app.get('/manga', async (req, res) => {
    const url = req.query.url;
    if (url === undefined) {
        res.status(400);
        res.json({error: 400, message: 'url parameter is missing'});
        res.end();
    } else {
        try {
            const manga = await scrapper.getMangaFromUrl(url);
            res.status(200);
            res.json(manga);
            res.end();
        } catch (e) {
            res.status(500);
            res.json({error:500, message:e.message})
            res.end();
        }
    }
});

app.listen(process.env.SERVER_PORT, (err) => {
    if (err) {
        throw err;
    }
    /* eslint-disable no-console */
    console.log('Server started, have fun ! 😊');
});