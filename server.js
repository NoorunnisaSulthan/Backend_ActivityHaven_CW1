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



// Middleware for CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

MongoClient.connect("mongodb+srv://snoorunnisa27:wednesday@cluster0.ygxz3.mongodb.net", { useUnifiedTopology: true })
    .then(client => {
        db = client.db('activity_haven');
        console.log("Connected to MongoDB");

       
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

    app.get('/', (req, res) => {
        res.send('Select a collection, e.g., /collection/activities');
    });
    
    
    // Middleware to handle collection names
    app.param('collectionName', (req, res, next, collectionName) => {
        req.collection = db.collection(collectionName);
        return next();
    });
    
    // Get all activities from a collection
    app.get('/collection/:collectionName', (req, res, next) => {
        
        req.collection.find({}).toArray((err, results) => {
            if (err) return next(err);
            
            res.send(results);
        });
    });

    //post data to collection
    app.post('/collection/:collectionName', (req, res, next) => {
        req.collection.insertOne(req.body, (err, result) => {
            if (err) return next(err);
            res.send(result.ops);
        });
    });
    