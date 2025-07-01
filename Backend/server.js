import Express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import path from 'path';
import rateLimit from 'express-rate-limit';
import fs, { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

import apiV1 from './api/apiV1';
import streamContentV1 from './content/streamContentV1';

const app_public = Express();
const app_private = Express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSH Database Connect : ssh -L localPort:localhost:serverPort -N -f -l username HostIP
const uri = 'mongodb://localhost:27020';
const client = new MongoClient(uri);
const db = client.db('movie_database');

const MEDIA_DIR = "/usr/local/bin/Hotstar/Media";
const FOLDER = {
    // Hardcoded To Prevent URL Attacks
    "audio_hin": "Audio_Hindi",
    "audio_en": "Audio_English",
    "video": "Video"
}

const logs = []

try {
    await client.connect();
    logs.push({ timestamp: new Date().toISOString(), message: 'MongoDB Connected' });
} catch (error) {
    logs.push({ timestamp: new Date().toISOString(), message: 'Connection Error : ' + error });
}

const fetch = async (collection, find, projection) => {
    try {
        const data = await db.collection(collection).findOne(find, { projection });
        logs.push({ timestamp: new Date().toISOString(), message: 'Successful Fetching : ' + JSON.stringify(find) });
        return data;
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Fetching Users : ' + error });
    }
};

const update = async (collection, id, update, projection) => {
    try {
        const result = await db.collection(collection).findOneAndUpdate(
            { _id: new ObjectId(id) },
            update,
            { upsert: true, returnDocument: 'after', projection }
        );
        logs.push({ timestamp: new Date().toISOString(), message: 'Successful Updating : ' + JSON.stringify(update) });
        return result;
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Updating User : ' + error });
    }
};



const session = require('express-session');
const MongoStore = require('connect-mongo');

app_public.use(session({
    secret: '', 
    resave: false,
    saveUninitialized: false, 
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/sessionDB' }), 
    cookie: {
        httpOnly: true,
        secure: true, 
        sameSite: strict,
        maxAge: 1000 * 60 * 60 * 72 
    }
}));



app_public.use(helmet());                                           // Configure It In Production
app_public.use(cors())                                              // Remove In Production
app_public.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});
app_public.use((req, res, next) => {
    if (req.url.includes('..') || req.url.includes('%2E%2E')) return res.status(400).send('Bad Request : Directory Traversal Attempt Detected.');
    next();
});
app_public.use('/', Express.static(path.join(__dirname, '../Frontend'), { maxAge: '1h' }));

app_public.use('/api/v1', apiV1);
app_public.use('/streamContent/v1', streamContentV1);

const pingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: "Too Many Requests!"
});
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).json({ message: 'Forbidden: Login Required' });
    }
    // If User Banned then return error too
    next();
};

/* 
Completed
localhost:4373/ping
*/
app_public.get('/ping', pingLimiter, function (req, res) {
    res.sendStatus(200);
})

app_public.post('/login', (req, res) => {
    // OAuth Google

    const { username, password } = req.body;

    // Verify user credentials (replace with actual authentication logic)
    if (username === 'admin' && password === 'password123') {
        req.session.user = { username }; // Assign session only on successful login
        return res.json({ message: 'Login successful' });
    }

    res.status(401).json({ message: 'Unauthorized' });
});

app_public.get('/logout', requireAuth, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

/* 
Completed
For Movies : localhost:4373/play/67eeeac7ca5dc42e95d2f24e/video
For Series : localhost:4373/play/681a451a9895e2705697ede9/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4/audio_english
*/
app_public.get('/play/:contentId/:type', requireAuth, async function (req, res) {
    const { series_id, season_id } = req.query;
    let filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.type + '.m3u8');
    if (series_id && season_id) filePath = path.join(MEDIA_DIR, series_id, season_id, req.params.contentId, req.params.type + '.m3u8');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
})
app_public.get('/play/:contentId/:seasonId/:episodeId/:type', requireAuth, async function (req, res) {
    const { series_id, season_id } = req.query;
    let filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.type + '.m3u8');
    if (series_id && season_id) filePath = path.join(MEDIA_DIR, series_id, season_id, req.params.contentId, req.params.type + '.m3u8');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
})

/* 
Completed
For Movies : localhost:4373/chunk/67eeeac7ca5dc42e95d2f24e/video/segment_001.ts
For Series : localhost:4373/chunk/67eeeac7ca5dc42e95d2f24e/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4/audio_en/segment_001.ts
*/
app_public.get('/chunk/:contentId/:type/:segment', requireAuth, (req, res) => {
    if (!(req.params.type in FOLDER)) res.status(404).send('Invalid Type');
    const filePath = path.join(MEDIA_DIR, req.params.contentId, FOLDER[req.params.type], req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});
app_public.get('/chunk/:contentId/:seasonId/:episodeId/:type/:segment', requireAuth, (req, res) => {
    if (!(req.params.type in FOLDER)) res.status(404).send('Invalid Type');
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, FOLDER[req.params.type], req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});

app_public.listen(4373);

/* 
Completed
localhost:4373/logs
*/
app_private.get('/logs', function (req, res) {
    // Note down logs with each session ID + IP + userID
    // Note down each IP address visiting, their session ID, device fingerprint and note down the routes

    res.json(Object.assign({}, logs));
})

app_private.get('/sessions', function (req, res) {
    // Allow At Max 100 Session IDs
})

app_private.get('/current', function (req, res) {
    // Show All Current Activity Going Arround
})

app_private.get('/flags', function (req, res) {
    // Security Flags
})

app_private.listen(4374);