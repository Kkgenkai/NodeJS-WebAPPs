//Blueprint for the server.js
const https = require('node:https');
const bodyParser = require('body-parser');

const express = require("express");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res)=>{
    const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=Ethiopia&appid=db6d6531b7c415e57d67393678491b74&units=metric";
    const imageURL =  "https://openweathermap.org/img/wn/10d@2x.png";
    https.get(apiURL, (response) => {
        // console.log('statusCode:', response.statusCode);
        // console.log('headers:', response.headers);
        //console.log(response);
        response.on('data', (d) => {
            //process.stdout.write(d);
            const weatherData = JSON.parse(d);
            const weatherIconID = weatherData.weather[0].icon;
            const imageURL = "https://openweathermap.org/img/wn/"+ weatherIconID +"@2x.png";
            res.write("<h1>Weather: " + weatherData.main.temp + "</h1>");
            res.write('<img src='+imageURL+'>');
            res.send();
        });
    });

    
});


app.listen(port, ()=>{
    console.log(`Server Started on Port: ${port}`);
});