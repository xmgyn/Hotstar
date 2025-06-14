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

router.get('/changeCollection', collectionLimiter, function (req, res) {
    let { collectionId } = req.query;
    // 
    res.sendStatus(200);
})

module.exports = router;