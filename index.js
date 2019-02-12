const express = require("express");
const path = require('path');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.connect(process.env.HEROKU_DB_URI, {useNewUrlParser: true});
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

const nav = require('./src/dbs/nav');

const app = express();

const port = process.env.PORT || 8080;

app.set("views", "./src/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname,'/node_modules/jquery/dist')));

const postRouter = require('./src/routes/postRoutes');
app.use('/post', postRouter);
const pageRouter = require('./src/routes/pageRouter');
app.use('/pages', pageRouter);

app.get('/', (async (req, res, next) => {
    try{
        let pagenation = {
            older : true,
            newer : false,
            currentPage : 1
        };
        let currentPage = 1;
        let posts = await db.model('posts', blogSchema, 'blogPosts')
            .find().sort('-date').skip(currentPage*4-4).limit(4).exec();
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
            dates,
            pagenation
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