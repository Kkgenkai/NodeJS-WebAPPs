const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', (req, res)=>{
    const qr = require('qr-image');
    const fs = require('fs');

    let imgName = "qr_img.png";

    const url = "https://" + req.body.userInput;
    let qr_svg = qr.image(url);
    qr_svg.pipe(fs.createWriteStream("qr_img.png"));
    res.sendFile(__dirname + "/" + imgName);
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});
