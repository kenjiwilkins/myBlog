const express = require('express');
const pageRouter = express.Router();
require('dotenv').config();
const moment = require('moment');
const mongoose = require('mongoose');
const nav = require('../dbs/nav');
const bodyParser = require('body-parser');

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
const commentSchema = new Schema({
    name: String,
    body: String,
    postid: String
});

pageRouter.use(bodyParser.urlencoded({extended:false}));
pageRouter.use(bodyParser.json());

pageRouter.route('/:num')
.get( async (req, res, next) =>{
    try{
        let logininfo = {
            login : false,
            userinfo : {}
        };
        if(req.user){
            logininfo.login = true;
            logininfo.userinfo = req.user.toObject();
        }
        let pagenation = {
            older : true,
            newer : true,
            currentPage : parseInt(req.params.num)
        };
        pagenation.olderPage = pagenation.currentPage + 1;
        pagenation.newerPage = pagenation.currentPage - 1;
        let posts = await db.model('posts', blogSchema, 'blogPosts')
            .find({}).sort('-date').skip(pagenation.currentPage*4-4).limit(4).exec();
        let dates = [];
        await db.model('posts', blogSchema, 'blogPosts').count({}, (err, count) => {
            if(count < pagenation.currentPage*4+8){
                pagenation.older = false;
            }
        });
        if(pagenation.currentPage <= 0){pagenation.newer = false}
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
            pagenation,
            logininfo
        });
    } catch (err) {
        next(err);
}
});

module.exports = pageRouter;