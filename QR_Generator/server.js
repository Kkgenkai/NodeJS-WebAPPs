const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', (req, res) => {
    const qr = require('qr-image');

    const url = "https://" + req.body.userInput;
    const qr_svg = qr.image(url, { type: 'png' });
    
    // Set the content type and send the image directly
    res.set('Content-Type', 'image/png');
    qr_svg.pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
