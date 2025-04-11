import Express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import path from 'path';
import fs from 'fs';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const db = client.db('test_database');
const MEDIA_DIR = "D:\\Work\\Play Projects\\New folder\\Media"
const timestamp = new Date().toISOString();

const logs = []

try {
    await client.connect();
    logs.push(timestamp + ' \\ MongoDB Connected');
} catch (error) {
    logs.push(timestamp + ' \\ Connection Error\\' + error);
}

const fetch = async (collection, find, projection) => {
    try {
        const data = await db.collection(collection).findOne(find, { projection });
        logs.push(timestamp + ' \\ Successful Fetching\\ ' + JSON.stringify(find));
        return data;
    } catch (error) {
        logs.push(timestamp + ' \\ Error Fetching Users\\ ' + error);
    }
};

const update = async (collection, id, update, projection) => {
    try {
        const result = await db.collection(collection).findOneAndUpdate(
            { _id: new ObjectId(id) },
            update,
            { upsert: true, returnDocument: 'after', projection }
        );
        logs.push(timestamp + ' \\ Successful Updating\\ ' + JSON.stringify(update));
        return result;
    } catch (error) {
        logs.push(timestamp + ' \\ Error Updating User\\ ' + error);
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


app.get('/getCollections', function (req, res) {
    //    // get - getCollections(all/movie/series/Favourites, R or Non-R) (list having all contents with full details)
    //    try {
    //        auto typeParam = req.url_params.get("type");
    //        auto ratingParam = req.url_params.get("rating");

    //        if (!typeParam || !ratingParam) {
    //            throw invalid_argument("Missing Query Parameters");
    //        }

    //        Content type;
    //        if (string(typeParam) == "all") {
    //            type = ALL;
    //        }
    //        else if (string(typeParam) == "movie") {
    //            type = MOVIES;
    //        }
    //        else if (string(typeParam) == "series") {
    //            type = SERIES;
    //        }
    //        else if (string(typeParam) == "favourites") {
    //            type = FAVOURITES;
    //        }
    //        else {
    //            throw invalid_argument("Invalid Type Value");
    //        }

    //        int ratingValue = stoi(ratingParam);
    //        Rating rating;
    //        if (ratingValue == 13456) {
    //            rating = R;
    //        }
    //        else if (ratingValue == 29348) {
    //            rating = A;
    //        }
    //        else {
    //            throw invalid_argument("Invalid Rating Value");
    //        }

    //        // Send a success response (placeholder logic)
    //        res.code = 200;
    //        res.body = "Collections retrieved successfully!";
    //        res.end();
    //    }
    //    catch (const exception& e) {
    //        res.code = 500;
    //        res.body = string("Error: ") + e.what();
    //        res.end();
    //    }
    //    // Example: type=all/movie/series/Favourites, rating=R or Non-R
    //    // Route: getCollections
});

/* 
Completed
localhost:4373/setFavourite?contentId=67eeeac7ca5dc42e95d2f24e
*/
app.get('/setFavourite', async function (req, res) {
    try {
        const { contentId } = req.query;
        const category = await fetch("All", { _id: new ObjectId(contentId) }, { "_id": 0, "Category": 1 });
        await update((category.Category ? "Series" : "Movies"), contentId, {
            $bit: {
                Favourite: { xor: 1 }
            }
        }, {});
        logs.push(timestamp + ' \\ Sucessfully Set Favourite\\ ' + contentId);
        res.sendStatus(200);
    } catch (error) {
        logs.push(timestamp + ' \\ Error Setting Favourite\\ ' + error);
        res.sendStatus(404);
    }
})

app.get('/getBackground/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.contentId + '_background.jpeg');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push(timestamp + ' \\ Error Sending Background\\ ' + error);
            res.status(500).send('Internal Server Error');
        }
    });
})

app.get('/getCard/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.contentId + '_card.jpeg');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push(timestamp + ' \\ Error Sending Card\\ ' + error);
            res.status(500).send('Internal Server Error');
        }
    });
})

app.get('/getPreview/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.contentId + '_preview.jpeg');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push(timestamp + ' \\ Error Sending Preview\\ ' + error);
            res.status(500).send('Internal Server Error');
        }
    });
})

app.get('/getIcon/:contentId', function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.contentId + '_icon.jpeg');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.sendFile(filePath, function (error) {
        if (error) {
            logs.push(timestamp + ' \\ Error Sending Icon\\ ' + error);
            res.status(500).send('Internal Server Error');
        }
    });
})

app.get('/play/:contentId', async function (req, res) {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.contentId + '.m3u8');
    if (!fs.existsSync(filePath)) res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
})

app.get('/chunks/:contentId/:segment', (req, res) => {
    const filePath = path.join(MEDIA_DIR, req.params.contentId, req.params.segment);
    if (!fs.existsSync(filePath)) res.status(404).send('Segment Not Found');
    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(filePath).pipe(res);
});

app.get('/streamImage/:contentId/:segment', function (req, res) {
    //     16 * 16 Image
})

app.listen(4373);