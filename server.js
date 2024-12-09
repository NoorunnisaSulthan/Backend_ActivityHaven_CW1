const express = require('express');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const path = require('path'); 
const fs = require('fs');   

const app = express();
app.use(express.json());
app.set('port', 3000);
const cors = require('cors');
app.use(cors());  

//logger middleware 
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} request to ${req.url}`);
    next();
});


app.use(function(req,res,next){
    var filepath=path.join(__dirname,"static",req.url)
    fs.stat(filepath,function(err,fileInfo){
        if(err){
            next();
            return;
        }
        if(fileInfo.isFile()) res.sendFile(filepath);
        else next();
    });
})



// Middleware for CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true"); //allows cookies to be sent
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
    
//put updated inventory count to document within collection
    app.put('/collection/:collectionName/:id', (req, res, next) => {
        req.collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            (err, result) => {
                if (err) return next(err);
                res.send(result.modifiedCount === 1 ? { msg: req.body } : { msg: 'error' });
            }
        );
    
    });
    
// Delete a document by ID
    app.delete("/collection/:collectionName/:id", (req, res, next) => {
        const collection = req.collection; 
        const objectId = new ObjectId(req.params.id); 
            collection.deleteOne({ _id: objectId }, (err, deleteResult) => {
            if (err) return next(err);
    
            // If no item was deleted, return an error message
            if (deleteResult.deletedCount !== 1) {
                return res.status(404).send({ msg: "Item not found or already deleted" });
            }
    
            // After deletion, retrieve the updated collection
            collection.find({}).toArray((err, results) => {
                if (err) return next(err);
    
                // Send the updated collection as the response
                res.send(results);``
            });
        });
    });


    //functionality to delete cart items from collection in db after checkout
    app.delete("/collection/:collectionName", (req, res, next) => {
    
    
        req.collection.deleteMany({}, (err, result) => {
            if (err) return next(err);
    
            res.send({
                msg: result.deletedCount > 0 ? "Cart cleared successfully" : "Cart is already empty",
            });
        });
    });

    app.get('/search', async (req, res, next) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).send({ error: 'Search query is required' });
        }
        try {
            const results = await db.collection('activities').find({
                $or: [
                    { activity: { $regex: q, $options: 'i' } }, 
                    { location: { $regex: q, $options: 'i' } },
                ],
            }).toArray();
            res.send(results);
        } catch (err) {
            next(err);
        }
    });
    
    