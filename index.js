"use strict";
let express = require('express');
let jetpack = require('fs-jetpack');
let crypto = require('crypto');
let path = require('path');
let multer = require('multer');
let mime = require('mime');
let mongoose = require('mongoose');


var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})

var upload = multer({ storage: storage });
let config = require('./config');

console.log(config.MongoDB_URL, "Hi");
var mongoDB = config.MongoDB_URL;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var imageSchema = new mongoose.Schema({ title: String, tags: Array, filename: String });
var Image = mongoose.model('Image', imageSchema);


let app = express();


app.post("/api/image", upload.single('image'), function(req, res){
    let item = {title: req.body.title, tags: JSON.parse(req.body.tags), filename: req.file.filename};
    //let store = data.getItemSync('images');
    //store.push(item);
    //data.setItemSync('images', store);
    //res.json(item);
    new Image(item).save().then(function(err, data){
        if(err){
            console.log(err);
        }
        res.send("Done");
    });
});

app.get("/api/images", (req, res) => {
   //res.json(jetpack.list("uploads/"));
    //res.json(data.getItemSync('images'));
    Image.find({}, 'title tags filename').exec(function(err, data){
        res.json(data);
    })
});

app.get("/image/:id", function(req, res){
    var pt = path.join(__dirname, "uploads");
    var search = req.params.id;
    res.sendFile(path.join(__dirname, jetpack.find(pt, { matching : search + "*"})[0] || ""));
});

app.del("/api/image/:id", function(req, res){

});

app.get("/images", function(req, res){
    Image.find().exec(function(err, data){
        let html = "<ul>";
        data.forEach(function(data){
            html += `<li><a href="/image/${data.filename}">${data.title}</a></li>`
        })
        html += "</ul>";
        res.send(html);
    });

});

app.listen(config.ListenPort, () => {
    console.log(`Listening on port ${config.ListenPort}`);
});