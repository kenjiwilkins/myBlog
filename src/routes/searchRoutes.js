const express = require('express');
const pageRouter = express.Router();
require('dotenv').config();
const moment = require('moment');
const mongoose = require('mongoose');
const nav = require('../dbs/nav');
const bodyParser = require('body-parser');

mongoose.connect("mongodb://KenjiWilkins:Haruki1984@ds247674.mlab.com:47674/posts", {useNewUrlParser: true});
const db = mongoose.connection;
const Schema = mongoose.Schema;
const blogSchema = new Schema({
    title: String,
    date: Date,
    author: String,
    postBody: String,
    category: String
});

searchRouter.use(bodyParser.urlencoded({extended:false}));
searchRouter.use(bodyParser.json());

searchRouter.route('/:num')
.get( async (req, res, next) =>{
try{
    let query = req.query.query;
    if(!query){
        return Promise.resolve(res.redirect('../'));
    }
    let pagenation = {
        older : true,
        newer : true,
        currentPage : parseInt(req.params.num)
    };
    let posts = await db.model('posts', blogSchema, 'blogPosts')
        .find({postBody: new RegExp(`.*${query}.*`)}).sort('-date').skip(pagenation.currentPage*4-4).limit(4)
        .exec();
    let dates = [];
    let count = 0;
    
    await posts.forEach(post => {
        dates.push(moment(post.date).format("MMMM Do YYYY"));
        count++;
    });
    if(pagenation.currentPage <= 0){pagenation.newer = false}
    if(count < pagenation.currentPage*4+8){pagenation.older = false} 
    res.render('search',{
        nav,
        title: "Ekubo mo Abata",
        page_heading: "Search Result: ",
        sub_heading: `${count} articles found`,
        posts,
        dates,
        pagenation
    });
} catch (err) {
    next(err);
}
});

module.exports = searchRouter;