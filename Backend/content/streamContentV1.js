import Express from 'express';

const router = Express.Router();

/* 
Completed
localhost:4373/getTrailer/67eeeac7ca5dc42e95d2f24e
*/
router.get('/getTrailer/:contentId', async function (req, res) {
    let filePath = path.join(MEDIA_DIR, req.params.contentId, 'trailer.mp4');
    if (!fs.existsSync(filePath)) return res.status(404).send('File Not Found');
    res.setHeader('Content-Type', 'video/mp4');
    fs.createReadStream(filePath).pipe(res);
})

/* 
Completed
localhost:4373/getBackground/67eeeac7ca5dc42e95d2f24e
*/
router.get('/getBackground/:contentId', function (req, res) {
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
router.get('/getCard/:contentId', function (req, res) {
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
router.get('/getPreview/:contentId', function (req, res) {
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
router.get('/getIcon/:contentId', function (req, res) {
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
router.get('/getSubtitle/:contentId', async function (req, res) {
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
For Movies : localhost:4373/streamImage/67eeeac7ca5dc42e95d2f24e/3/3
For Series : localhost:4373/streamImage/681a451a9895e2705697ede9/3/3?series_id=681a3f8f9895e2705697eddc&season_id=681a44ed9895e2705697ede8
*/
router.get('/streamImage/:contentId/:minute/:phase', function (req, res) {
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

export default router;