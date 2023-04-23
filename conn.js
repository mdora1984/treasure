var mysql = require('mysql')
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"Apto123"
});

conn.connect(function(err){
    if(err)
        throw err;  
    console.log("Connection Successfull..")
})