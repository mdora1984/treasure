var mysql = require('mysql')

const express = require("express");
const app = express()
const PORT = process.env.PORT || 3000

app.set('view engine','ejs');

const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();

var session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use('/assets', express.static('assets'));
app.use('/resources', express.static('resources'));

var connection = mysql.createConnection({
    host: "sql12.freemysqlhosting.net",
    user: "sql12614019",
    password:"WrVSrP1R4R",
    database: "sql12614019"
});

connection.connect(function(err){
    if(err)
        throw err;  
    console.log("Connection Successfull..");
})

app.get("/", function(req, res){
    res.render('index')
})

app.post("/signIn", encoder, function(req, res){
    var userMailID = req.body.userMailID;
    var password = req.body.password;
    connection.query("select * from login where userMailID = ? and password = ?",[userMailID, password], function(error, results, fields){
        if (results.length > 0){
            req.session.loggedIn = true;
            Object.keys(results).forEach(key => {
                var row = results[key];
                req.session.userID = row.userID;
                req.session.userMailID = row.userMailID
              });
            res.redirect("/emojiHunt.html");
        }
        else{
            res.redirect("/");
        }
        res.end();
    })
})

app.post("/register", encoder, function(req, res){
    var userMailID = req.body.userMailID;
    var password = req.body.password;
    var falseValue = false;
    
    connection.query("select * from login where userMailID = ? and password = ?",[userMailID, password], function(error, results, fields){
        if (results.length > 0){
            // res.writeHead( 400, 'Already Registered', {'content-type' : 'text/plain'});
            res.redirect("/");
        }
        else{
            connection.query("INSERT INTO login(userMailID, password, isAdmin) values(?, ?, ?)",[userMailID, password, falseValue], function(){
                res.redirect("/");
                res.end();
            })
        }
    })
})

app.post("/saveAns", encoder, function(req, res){
    var newLevelUnlocked = (req.cookies[`levelUnlocked`]);
    var timeTaken = (req.cookies[`timeTaken`]);

    console.log("madhu"+newLevelUnlocked);
    var userID = req.session.userID;

    connection.query("SELECT userID from usergamedata where userID = ?", [userID], function(error, results, fields){
        if(results.length > 0){
            console.log(req.session.userID);
            console.log(newLevelUnlocked);
            connection.query("UPDATE usergamedata SET levelunlocked = ?, timeTaken = ? WHERE userID = ?",[newLevelUnlocked, timeTaken, userID], function(error, results, fields){
                // res.redirect("/emojiHunt.html");
            })
        }
        else{
            connection.query("INSERT INTO usergamedata(userID, levelUnlocked, accuracy, timeTaken) values(?, ?, 0, 0);",[userID, newLevelUnlocked], function(error, results, fields){
                // res.redirect("/emojiHunt.html");
            })
        }
    })
                res.redirect("/emojiHunt.html");
    
    res.end();  
})

app.post("/logOut", encoder, function(req, res){
    console.log("Logging Off")
    req.session.destroy((err) => {
        res.redirect('/') // will always fire after session is destroyed
      })
})

app.get("/emojiHunt.html", function(req, res){
    var levelUnlocked = 0;
    var timeTaken;
    if(req.session.loggedIn){
        // res.cookie(`levelUnlocked`,0);
        var userID = req.session.userID;
        connection.query("select levelUnlocked, timeTaken from usergamedata where userID = ?",[userID], function(error, results, fields){
        console.log(results[0]);
        if(results.length > 0){
            console.log(results[0]);
            Object.keys(results).forEach(key => {
                var row = results[key];
                levelUnlocked = row.levelUnlocked;
                timeTaken = row.timeTaken;
                console.log(levelUnlocked);
                var user = {
                    userID: userID,
                    userMailID: req.session.userMailID,
                    levelUnlocked: levelUnlocked,
                    timeTaken: timeTaken
                }
                res.render("emojiHunt", {user});

                // res.cookie(`levelUnlocked`,row.levelUnlocked);
            });
        }
        else{
            var user = {
                userID: userID,
                userMailID: req.session.userMailID,
                levelUnlocked: levelUnlocked,
                timeTaken: timeTaken
            }
            res.render("emojiHunt", {user});
        }
                // res.redirect("/emojiHunt.html");
        })
        console.log("ok");
        console.log(levelUnlocked);

        

        // res.sendFile(__dirname + "/emojiHunt.html");
    }
    else{
        res.send('Please login to view this page');
    }
})
// set app port
app.listen(PORT, () => {

})