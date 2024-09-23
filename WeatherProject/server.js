const https = require('node:https');
const bodyParser = require('body-parser');
const dotEnv = require('dotenv');

const express = require("express");
const app = express();
const PORT = process.env.PORT ||3000;

dotEnv.config();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.post('/', (req, res)=>{
    let cityName = req.body.state;
    const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid="+ process.env.apikeyOpenWeather.toString() +"&units=metric";
    https.get(apiURL, (response) => {
        console.log('statusCode:', response.statusCode);

        response.on('data', (data) => {
            const weatherData = JSON.parse(data);

            const weatherDescription = weatherData.weather[0].description;
            const temprature = weatherData.main.temp + " &degc";
            const pressure = weatherData.main.pressure;
            const weatherIconID = weatherData.weather[0].icon;
            const imageURL = "https://openweathermap.org/img/wn/"+ weatherIconID +"@2x.png";
            
            res.write("<h1>The Weather in " + cityName + " is " + weatherDescription + ". </h1>");
            res.write("<h2>Temprature: " + temprature + "</h2>");
            res.write("<h2>Pressure: " + pressure + "</h2>");
            res.write('<img src=' + imageURL +'>');
            res.send();
        });
    });
});


app.listen(PORT, ()=>{
    console.log(`Server Started on Port: ${PORT}`);
});