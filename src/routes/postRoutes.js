const express = require('express');
const {MongoClient} = require('mongodb');
const postRouter = express.Router();
require('dotenv').config();
//const uri = process.env.DB_URI;
const moment = require('moment');
const mongoose = require('mongoose');
const nav = require('../dbs/nav');

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

postRouter.route('/:id')
.get( async (req, res, next) =>{
    try{
        
        // const db = await mongoose.connection;
        // const Schema = mongoose.Schema;
        // const blogSchema = new Schema({
        //     title: String,
        //     date: Date,
        //     author: String,
        //     postBody: String,
        //     category: String
        // });

        let post = await db.model('posts', blogSchema, 'blogPosts')
        .findOne({_id : req.params.id}).exec();
        let date = await moment(post.date).format("MMMM Do YYYY");
        res.render('post',{
            nav,
            title: "Ekubo mo Abata",
            page_heading: "えくぼもあばた",
            sub_heading: "by Kenji Wilkins",
            post,
            date
        });
    }
    catch(err) {
        next(err);
    }
});


module.exports = postRouter;