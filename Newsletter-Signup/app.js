const dotEnv = require('dotenv');
const https = require('node:https');
const bodyParser = require("body-parser");
const express = require("express");

dotEnv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/signup.html");
});

app.post('/', (req, res)=>{
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    const url = process.env.url;

    const options = {
        method: "POST",
        auth: process.env.auth
    }

    console.log('URL:', url);
    console.log('AUTH:', options.auth);

    const request = https.request(url, options, (response) => {
        if (response.statusCode === 200) {
            res.send("Successfully subscribed!");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        response.on("data", (data) => {
            console.log(JSON.parse(data));
        });
    })

    request.write(jsonData);
    request.end();
});

app.post('/failure', (req, res)=>{
    res.redirect('/');
});

app.listen(PORT, ()=>{
    console.log(`Server Running on Port: ${PORT}`);
});