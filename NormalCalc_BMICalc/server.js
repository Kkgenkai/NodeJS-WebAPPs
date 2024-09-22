const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/normalCalc.html");
});

app.get("/bmiCalculator", (req, res)=>{
    res.sendFile(__dirname + "/bmiCalc.html");
});

app.post("/", (req, res)=>{
    let answer = ()=>{
        let num1 = Number(req.body.num1);
        let num2 = Number(req.body.num2);
        let op = req.body.op;

        switch(op){
            case "add":
                return num1 + num2;
            case "sub":
                return num1 - num2;
            case "mul":
                return num1 * num2;
            case "div":
                return num1 / num2;
        }
    }
    res.send(`Answer: ` + answer());
});

app.post("/bmiCalculator", (req, res)=>{
    let answer = ()=>{
        let weight = Number(req.body.weight);
        let height = Number(req.body.height);
        let BMI = weight / (height**2);


        return BMI;
    }
    res.send(`Your BMI is: ${(answer().toFixed(2))}`);
});

app.listen(PORT, ()=>{
    console.log(`Server Started on port: ${PORT}`);
}); 