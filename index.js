const express = require("express");
const path = require('path');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const wrap = require('./src/middleware/wrap');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.connect(uri,{useNewUrlParser: true});
//mongoose.connect(uri, {useNewUrlParser: true, dbName: 'posts'});
const db = mongoose.connection;
const Schema = mongoose.Schema;
const blogSchema = new Schema({
    title: String,
    date: Date,
    author: String,
    postBody: String,
    category: String
});
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(){
    const model = db.model('posts', blogSchema, 'blogPosts');
    const query = model.find({}).sort("-date").exec();
    query.then((value) => {
        posts = value;
    })
});

const nav = require('./public/js/nav');

const app = express();

const adminRouter = require('./src/routes/adminRoutes')(nav);
const port = process.env.PORT || 8080;
//app.use('/post', postRouter);
//app.use('/admin', adminRouter);

app.set("views", "./src/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname,'/node_modules/jquery/dist')));


const postRouter = require('./src/routes/postRoutes');
app.use('/post', postRouter);

app.get('/', wrap(async (req, res, next) => {
    try{
        let posts = await db.model('posts', blogSchema, 'blogPosts')
            .find({}).sort('-date').exec();
        let dates = [];
        await posts.forEach(post => {
            dates.push(moment(post.date).format("MMMM Do YYYY"));
        });
        res.render('index',{
            nav,
            title: "Ekubo mo Abata",
            page_heading: "えくぼもあばた",
            sub_heading: "by Kenji Wilkins",
            posts,
            dates
        });
    } catch (err) {
        next(err);
}
}));


app.get('/about', (req, res) => {
    res.render('about', {
        nav,
        title: "About this blog",
        page_heading: "えくぼもあばた",
        sub_heading: "by Kenji Wilkins"
    })
})

app.listen(port);