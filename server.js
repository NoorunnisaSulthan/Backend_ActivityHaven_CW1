const express = require('express');
const { ObjectID, ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const path = require('path'); 
const fs = require('fs');   

const app = express();
app.use(express.json());
app.set('port', 3000);
const cors = require('cors');
app.use(cors());  

//middleware 
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} request to ${req.url}`);
    next();
});

app.use(function (req, res, next) {
    const filepath = path.join(__dirname, "static", req.url);
    fs.stat(filepath, function (err, fileInfo) {
        if (err) {
            next(); // File not found, proceed to the next middleware
            return;
        }
        if (fileInfo.isFile()) {
            res.sendFile(filepath); // Serve the file if it exists
        } else {
            next(); // Not a file, proceed to the next middleware
        }
    });
});

// Middleware for CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

