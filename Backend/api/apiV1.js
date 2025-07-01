import Express from 'express';

const router = Express.Router();

const collectionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    handler: (req, res) => {
        sendMessage("Too Many Collection Changing Detected! Please Wait For An Hour");
        res.status(429).json({ error: "Account Flagged, API Access Detected!" });
    }
});

function sendMessage() {
    // Send Message Through Whatsapp API
}

router.get('/getCollection/:collectionId/:category', async function (req, res) {
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

router.get('/changeCollection', collectionLimiter, function (req, res) {
    let { collectionId } = req.query;
    // Check If Collection Exists And Send The Message
    res.sendStatus(200);
})

router.get('/setCollection', collectionLimiter, function (req, res) {
    let { collectionId } = req.query;
    // Change The Collection In Database('User')
    // Update The User Memory Table
    res.sendStatus(200);
})


/* 
Completed
localhost:4373/getDetails/67eeeac7ca5dc42e95d2f24e
*/
router.get('/getDetails/:contentId', async function (req, res) {
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
localhost:4373/setFavourite/67eeeac7ca5dc42e95d2f24e
*/
router.get('/setFavourite/:contentId', async function (req, res) {
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

export default router;