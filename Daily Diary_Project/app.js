const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = 3000 || process.env.PORT;
const app = express();
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/static', express.static(__dirname + "/views/public"));


(function (){
    let diaries = [
        {
            id: 1,
            title: "Today",
            date: 2024-10-20,
            content: "Today"
        },
        {
            id: 2,
            title: "Tommorow",
            date: 2024-10-19,
            content: "Tommorow"
        },
        {
            id: 3,
            title: "Yesterday",
            date: 2024-10-21,
            content: "Yesterday"
        }
    ];

        //GET Request Handlers
        app.get('/', (req, res)=>{
            res.render("home", {diaries: diaries, tab: "Home"});
        });
        
        app.get('/compose', (req, res)=>{
            res.render("compose", {tab: "Compose"});
        });
        
        app.get('/diary/:Did', (req, res, next)=>{
            let Did = Number(req.params.Did);
            // Check if diaries array is not empty
            if (diaries.length !== 0) {
                let found = false; // Flag to track if diary is found

                diaries.forEach(diary => {
                    if (diary.id === Did) {
                        found = true; // Diary found
                        let title = _.lowerCase(diary.title);
                        return res.render("diary", { diary: diary, tab: title }); // Send response and exit
                    }
                });

                // If no diary was found, proceed to next middleware
                if (!found) {
                    return next(); // Pass to the 404 handler
                }
            } else {
                return next(); // If no diaries exist, pass to the 404 handler
            }
        });
        
        
        
        
        //POST Request Handlers
        app.post('/compose', (req, res)=>{
            let diary = {
                id: diaries.length + 1,
                title: req.body.title,
                date: req.body.date,
                content: req.body.content
            }
        
            diaries.push(diary);
            res.redirect('/'); //Redirect To Sort
        })
        
        app.post('/edit', (req, res)=>{
            let id = Number(req.body.edit);
        
            const dTBEd = diaries.filter(diary => diary.id === id);
            res.render("edit", {diary: dTBEd[0], tab: "Edit"});    
        })
        
        app.post('/update', (req, res)=>{
            let diary = {
                id: Number(req.body.update),
                title: req.body.title,
                date: req.body.date,
                content: req.body.content
            }
        
            const dTBUd = diaries.map((element)=>{
                if(element.id === diary.id){
                    element = diary;
                    return element;
                }
        
                return element;
            });
        
            diaries = dTBUd;
            res.redirect('/'); //Redirect To Sort
        })
        
        app.post('/delete', (req, res)=>{
            let id = Number(req.body.delete);
        
            const dTBDd = diaries.filter(element => element.id !== id);
            diaries = dTBDd;
            res.redirect('/'); //Redirect To Sort
        })
        

        
        // Custom 404 handler
        app.use((req, res, next) => {
            res.status(404).render("404", { message: "We Couldn't Find The Page Your Looking For...", tab: "404 - Page Not Found"});
        });

        app.listen(PORT, ()=> console.log(`Server is Running on Port: ${PORT}`));
}());