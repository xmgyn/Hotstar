import Express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import path from 'path';
import rateLimit from 'express-rate-limit';
import fs, { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

import apiV1 from './apiV1';

const app_public = Express();
const app_private = Express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use('/api/v1', apiV1);



const pingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: "Too Many Requests!"
});

/* 
Completed
localhost:4373/ping
*/
app_public.get('/ping', pingLimiter, function (req, res) {
    res.sendStatus(200);
})

app_public.get('/getCollections/:collectionId/:category', async function (req, res) {
    try {
        if (req.params.category == "Home") {
            const result = await (db.collection("All").find({}, { "_id": 1, "Category": 1 })).toArray();
            const filteredResult = (await Promise.all(result.map(async (entry) => {
                const update = await fetch(entry.Category, { _id: new ObjectId(entry._id) }, {});
                update.Type = entry.Category;
                update.Favourite = entry.Favourite;
                if ((!rating) && (update.R !== true)) return update;
                else if (rating) return update;
            }))).filter((update) => update != null);
            logs.push({ timestamp: new Date().toISOString(), message: 'Sucessfully Get Collection All' });
            if (!res.headersSent) res.status(200).send(filteredResult);
        }
        else if (req.params.category == "Movies" || req.params.category == "Series") {
            let { rating } = req.query;
            rating = rating === "true";
            const result = await (db.collection(req.params.category).find({}, {})).toArray();

            const filteredResult = (await Promise.all(
                result.map(async (entry) => {
                    const update = await fetch("All", { _id: new ObjectId(entry._id) }, {});
                    entry.Favourite = update.Favourite;
                    entry.Type = update.Category;
                    if ((!rating) && (entry.R !== true)) return entry;
                    else if (rating) return entry;
                })
            )).filter((update) => update != null);;
            logs.push({ timestamp: new Date().toISOString(), message: `Sucessfully Get Collection ${req.params.category}` });
            if (!res.headersSent) res.status(200).send(filteredResult);
        }
        else if (req.params.category == "Favourites") {
            let { rating } = req.query;
            rating = rating === "true";
            const result = await (db.collection("All").find({}, { "_id": 1, "Category": 1 })).toArray();
            const filteredResult = (await Promise.all(result.map(async (entry) => {
                const update = await fetch(entry.Category, { _id: new ObjectId(entry._id) }, {});
                update.Type = entry.Category;
                update.Favourite = entry.Favourite;
                if (update.Favourite === true && ((!rating) && (update.R !== true))) return update;
                else if (update.Favourite === true && rating) return update;
            }))).filter((update) => update != null);
            logs.push({ timestamp: new Date().toISOString(), message: 'Sucessfully Get Collection Favourites' });
            if (!res.headersSent) res.status(200).send(filteredResult);
        }
        else if (req.params.category == "Resume") {
            let { rating } = req.query;
            rating = rating === "true";
            const result = await (db.collection("All").find({}, { "_id": 1, "Category": 1 })).toArray();
            const filteredResult = (await Promise.all(result.map(async (entry) => {
                const update = await fetch(entry.Category, { _id: new ObjectId(entry._id) }, {});
                update.Type = entry.Category;
                update.Favourite = entry.Favourite;
                if (update.Favourite === true && ((!rating) && (update.R !== true))) return update;
                else if (update.Favourite === true && rating) return update;
            }))).filter((update) => update != null);
            logs.push({ timestamp: new Date().toISOString(), message: 'Sucessfully Get Collection Favourites' });
            if (!res.headersSent) res.status(200).send(filteredResult);
        }
        else {
            throw new Error("Category Not Defined");
        }
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Getting Collection : ' + error });
        if (!res.headersSent) res.status(404).json({ error: "Error Getting Collection", details: error.toString() });
    }
});

/* 
Completed
localhost:4373/getDetails/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getDetails/:contentId', async function (req, res) {
    try {
        const result = await fetch("Details", { _id: new ObjectId(req.params.contentId) }, {});
        if (!result) throw new Error('No Details Available');
        logs.push({ timestamp: new Date().toISOString(), message: 'Sucessfully Get Details : ' + req.params.contentId });
        res.status(200).send(result);
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Getting Details : ' + error });
        res.sendStatus(404);
    }
})

/* 
Completed
localhost:4373/getTrailer/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getTrailer/:contentId', async function (req, res) {
    let filePath = path.join(MEDIA_DIR, req.params.contentId, 'trailer.mp4');
    if (!fs.existsSync(filePath)) return res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'video/mp4');
    fs.createReadStream(filePath).pipe(res);
})

/* 
Completed
localhost:4373/setFavourite/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/setFavourite/:contentId', async function (req, res) {
    try {
        const category = await fetch("All", { _id: new ObjectId(req.params.contentId) }, { "_id": 0, "Favourite": 1 });
        await update("All", req.params.contentId, {
            $set: { "Favourite": !category.Favourite }
        }, {});
        logs.push({ timestamp: new Date().toISOString(), message: 'Sucessfully Set Favourite : ' + req.params.contentId });
        res.sendStatus(200);
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Setting Favourite : ' + error });
        res.sendStatus(404);
    }
})

/* 
Completed
localhost:4373/getBackground/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getBackground/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'background.png');
    if (!fs.existsSync(filePath)) { if (!res.headersSent) res.status(404).send('File Not Found'); }
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp: new Date().toISOString(), message: 'Error Sending Background : ' + error });
            if (!res.headersSent) res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getCard/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getCard/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'card.png');
    if (!fs.existsSync(filePath)) return res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp: new Date().toISOString(), message: 'Error Sending Card ' + error });
            if (!res.headersSent) res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getPreview/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getPreview/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'preview.png');
    if (!fs.existsSync(filePath)) return res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp: new Date().toISOString(), message: 'Error Sending Preview : ' + error });
            if (!res.headersSent) res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getIcon/67eeeac7ca5dc42e95d2f24e
*/
app_public.get('/getIcon/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'icon.png');
    if (!fs.existsSync(filePath)) return res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp: new Date().toISOString(), message: 'Error Sending Icon : ' + error });
            if (!res.headersSent) res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
For Movies : localhost:4373/getSubtitle/67eeeac7ca5dc42e95d2f24e
For Series : localhost:4373/getSubtitle/681a451a9895e2705697ede9?series_id=681a3f8f9895e2705697eddc&season_id=681a44ed9895e2705697ede8
*/
app_public.get('/getSubtitle/:contentId', async function (req, res) {
    try {
        const { series_id, season_id } = req.query;
        let filePath = path.join(MEDIA_DIR, req.params.contentId, 'subtitles_en.vtt');
        if (series_id && season_id) filePath = path.join(MEDIA_DIR, series_id, season_id, req.params.contentId, 'subtitles_en.vtt');
        if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
        logs.push({ timestamp: new Date().toISOString(), message: 'Success Getting Subtitle : ' + contentId });
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Getting Subtitle : ' + error });
        res.status(500).send('Internal Server Error');
    }
})

/* 
Completed
For Movies : localhost:4373/play/67eeeac7ca5dc42e95d2f24e/video
For Series : localhost:4373/play/681a451a9895e2705697ede9/audio_english?series_id=681a3f8f9895e2705697eddc&season_id=681a44ed9895e2705697ede8
*/
app_public.get('/play/:contentId/:type', async function (req, res) {
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
app_public.get('/chunk/:contentId/:type/:segment', (req, res) => {
    if (!(req.params.type in FOLDER)) res.status(404).send('Invalid Type');
    const filePath = path.join(MEDIA_DIR, req.params.contentId, FOLDER[req.params.type], req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});
app_public.get('/chunk/:contentId/:seasonId/:episodeId/:type/:segment', (req, res) => {
    if (!(req.params.type in FOLDER)) res.status(404).send('Invalid Type');
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, FOLDER[req.params.type], req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});

/* 
Completed
For Movies : localhost:4373/streamImage/67eeeac7ca5dc42e95d2f24e/3/3
For Series : localhost:4373/streamImage/681a451a9895e2705697ede9/3/3?series_id=681a3f8f9895e2705697eddc&season_id=681a44ed9895e2705697ede8
*/
app_public.get('/streamImage/:contentId/:minute/:phase', function (req, res) {
    try {
        const { series_id, season_id } = req.query;
        let filePath = path.join(MEDIA_DIR, req.params.contentId, 'Previews', 'thumb_minute_' + req.params.minute + '_' + req.params.phase + '_grid.jpg');
        if (series_id && season_id) filePath = path.join(MEDIA_DIR, series_id, season_id, req.params.contentId, 'Previews', 'thumb_minute_' + req.params.minute + '_' + req.params.phase + '_grid.jpg');
        if (!fs.existsSync(filePath)) res.status(404).send('Image Not Found');
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp: new Date().toISOString(), message: 'Error Getting Stream Image : ' + error });
        res.status(500).send('Internal Server Error');
    }
})

app_public.listen(4373);

/*
Note down each IP address visiting, their session ID, device fingerprint and note down the routes
Note down logs with each session ID
Allow At Max 100 Session IDs
Session ID to only those who have logged in, guests not allowed, login using Phone Number Verification Only
Avoid Using Any Disposible Phone Numbers
app_private/security_flags have any user with multiple failed login, 
*/


/* 
Completed
localhost:4373/logs
*/
app_private.get('/logs', function (req, res) {
    res.json(Object.assign({}, logs));
})

app_private.listen(4374);








app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verify user credentials (replace with actual authentication logic)
    if (username === 'admin' && password === 'password123') {
        req.session.user = { username }; // Assign session only on successful login
        return res.json({ message: 'Login successful' });
    }

    res.status(401).json({ message: 'Unauthorized' });
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).json({ message: 'Forbidden: Login Required' });
    }
    next();
};

// Protect a route using the authentication middleware
app.get('/dashboard', requireAuth, (req, res) => {
    res.json({ message: `Welcome, ${req.session.user.username}!` });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});
