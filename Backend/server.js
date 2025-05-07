import Express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import path from 'path';
import fs, { copyFileSync } from 'fs';

const uri = 'mongodb://localhost:27020';
const client = new MongoClient(uri);
const db = client.db('movie_database');
const MEDIA_DIR = "/usr/local/bin/Hotstar/Media"
const timestamp = new Date().toISOString();

const logs = []

try {
    await client.connect();
    logs.push({ timestamp : 'MongoDB Connected' });
} catch (error) {
    logs.push({ timestamp : 'Connection Error : ' + error });
}

const fetch = async (collection, find, projection) => {
    try {
        const data = await db.collection(collection).findOne(find, { projection });
        logs.push({ timestamp : 'Successful Fetching : ' + JSON.stringify(find) });
        return data;
    } catch (error) {
        logs.push({ timestamp : 'Error Fetching Users : ' + error });
    }
};

const update = async (collection, id, update, projection) => {
    try {
        const result = await db.collection(collection).findOneAndUpdate(
            { _id: new ObjectId(id) },
            update,
            { upsert: true, returnDocument: 'after', projection }
        );
        logs.push({ timestamp : 'Successful Updating : ' + JSON.stringify(update) });
        return result;
    } catch (error) {
        logs.push({ timestamp : 'Error Updating User : ' + error });
    }
};



const app = Express()
app.use(cors())

/* 
Completed
localhost:4373/ping
*/
app.get('/ping', function (req, res) {
    res.sendStatus(200);
})

/* 
Completed
localhost:4373/logs
*/
app.get('/logs', function (req, res) {
    res.end(JSON.stringify(logs));
})


app.get('/getCollections/:category', async function (req, res) {
    try {
        if (req.params.category == "All") {
            let { rating } = req.query;
            rating = (rating == 18203) ? true : false;
            const result = await (db.collection("All").find({}, { "_id": 1, "Category": 1 })).toArray();
            const filteredResult = (await Promise.all(result.map(async (entry) => {
                const update = await fetch(entry.Category, { _id: new ObjectId(entry._id) }, {});
                update.Favourite = entry.Favourite;
                if ((!rating) && (update.R !== true)) return update;
            }))).filter((update) => update != null);
            logs.push({ timestamp : 'Sucessfully Get Collection All' });
            res.status(200).send(filteredResult);
        }
        else if (req.params.category == "Movies" || req.params.category == "Series") {
            let { rating } = req.query;
            rating = (rating == 18203) ? true : false;
            const result = await (db.collection(req.params.category).find({}, {})).toArray();

            const filteredResult = await Promise.all(
                result
                    .filter((entry) => entry.R === rating) 
                    .map(async (entry) => {
                        const update = await fetch("All", { _id: new ObjectId(entry._id) }, { "_id": 1, "Favourite": 1 });
                        entry.Favourite = update.Favourite;
                        return entry; 
                    })
            );
            logs.push({ timestamp : `Sucessfully Get Collection ${req.params.category}` });
            res.status(200).send(filteredResult);
        }
        else if (req.params.category == "Favourites") {
            let { rating } = req.query;
            rating = (rating == 18203) ? true : false;
            const result = await (db.collection("All").find({}, { "_id": 1, "Category": 1 })).toArray();
            const filteredResult = (await Promise.all(result.map(async (entry) => {
                const update = await fetch(entry.Category, { _id: new ObjectId(entry._id) }, {});
                update.Favourite = entry.Favourite;
                if (update.Favourite === true || ((!rating) && (update.R !== true))) return update;
            }))).filter((update) => update != null);
            logs.push({ timestamp : 'Sucessfully Get Collection Favourites' });
            res.status(200).send(filteredResult);
        }
        else {
            throw new Error("Category Not Defined");
        }
    } catch (error) {
        logs.push({ timestamp : 'Error Getting Collection : ' + error });
        res.sendStatus(404);
    }
});

app.get('/getDetails/:contentId', function (req, res) {
    // Not Done
})

/* 
Completed
localhost:4373/setFavourite?contentId=67eeeac7ca5dc42e95d2f24e
*/
app.get('/setFavourite', async function (req, res) {
    try {
        const { contentId } = req.query;
        const category = await fetch("All", { _id: new ObjectId(contentId) }, { "_id": 0, "Favourite": 1 });
        await update("All", contentId, {
            $set: { "Favourite": !category.Favourite }
        }, {});
        logs.push({ timestamp : 'Sucessfully Set Favourite : ' + contentId });
        res.sendStatus(200);
    } catch (error) {
        logs.push({ timestamp : 'Error Setting Favourite : ' + error });
        res.sendStatus(404);
    }
})

/* 
Completed
localhost:4373/getBackground/67eeeac7ca5dc42e95d2f24e
*/
app.get('/getBackground/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'background.png');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp : 'Error Sending Background : ' + error });
            res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getCard/67eeeac7ca5dc42e95d2f24e
*/
app.get('/getCard/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'card.png');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp : 'Error Sending Card ' + error });
            res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getPreview/67eeeac7ca5dc42e95d2f24e
*/
app.get('/getPreview/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'preview.png');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp : 'Error Sending Preview : ' + error });
            res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
localhost:4373/getIcon/67eeeac7ca5dc42e95d2f24e
*/
app.get('/getIcon/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, 'icon.png');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push({ timestamp : 'Error Sending Icon : ' + error });
            res.status(500).send('Internal Server Error');
        }
    });
})

/* 
Completed
For Movies : localhost:4373/getSubtitle/67eeeac7ca5dc42e95d2f24e
For Series : localhost:4373/getSubtitle/67eeeac7ca5dc42e95d2f24e/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4
*/
app.get('/getSubtitle/:contentId', async function (req, res) {
    try {
        const filePath = path.join(MEDIA_DIR, req.params.contentId, 'subtitles_en.vtt');
        if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
        logs.push({ timestamp : 'Success Getting Subtitle : ' + contentId });
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp : 'Error Getting Subtitle : ' + error });
        res.status(500).send('Internal Server Error');
    }
})
app.get('/getSubtitle/:contentId/:seasonId/:episodeId/', async function (req, res) {
    try {
        const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, 'subtitles_en.vtt');
        if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
        logs.push({ timestamp : 'Success Getting Subtitle : ' + `${contentId}/${seasonId}/${episodeId}` });
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp : 'Error Getting Subtitle : ' + error });
        res.status(500).send('Internal Server Error');
    }
})

/* 
Completed
For Movies : localhost:4373/play/67eeeac7ca5dc42e95d2f24e
For Series : localhost:4373/play/67eeeac7ca5dc42e95d2f24e/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4
*/
app.get('/play/:contentId/:output?', async function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.output || 'master.m3u8');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
})
app.get('/play/:contentId/:seasonId/:episodeId/:output?', async function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, req.params.output || 'master.m3u8');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
})

/* 
Completed
For Movies : localhost:4373/chunk/67eeeac7ca5dc42e95d2f24e/segment_001.ts
For Series : localhost:4373/chunk/67eeeac7ca5dc42e95d2f24e/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4/segment_001.ts
*/
app.get('/chunk/:contentId/:segment', (req, res) => {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});
app.get('/chunk/:contentId/:seasonId/:episodeId/:segment', (req, res) => {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});

/* 
Completed
For Movies : localhost:4373/streamImage/67eeeac7ca5dc42e95d2f24e/3
For Series : localhost:4373/streamImage/67eeeac7ca5dc42e95d2f24e/6817190261ae4f0036444125/680c6ae1e4fd19fd42e6aea4/3
*/
app.get('/streamImage/:contentId/:minute', function (req, res) {
    try {
        const filePath = path.join(MEDIA_DIR, req.params.contentId, 'Previews', 'thumb_minute_' + minute + '_grid.jpg');
        if (!fs.existsSync(filePath)) res.status(404).send('Image Not Found');
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp : 'Error Getting Stream Image : ' + error });
        res.status(500).send('Internal Server Error');
    }
})
app.get('/streamImage/:contentId/:seasonId/:episodeId/:minute', function (req, res) {
    try {
        const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.seasonId, req.params.episodeId, 'Previews', 'thumb_minute_' + minute + '_grid.jpg');
        if (!fs.existsSync(filePath)) res.status(404).send('Image Not Found');
        res.sendFile(filePath);
    } catch (error) {
        logs.push({ timestamp : 'Error Getting Stream Image : ' + error });
        res.status(500).send('Internal Server Error');
    }
})

app.listen(4373);