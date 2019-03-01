const express = require('express');
const postRouter = express.Router();
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
        postid: String,
        date: Date
    });

postRouter.use(bodyParser.urlencoded({extended:false}));
postRouter.use(bodyParser.json());

postRouter.route('/:id')
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
        let id = req.params.id;
        let post = await db.model('posts', blogSchema, 'blogPosts')
        .findOne({_id : req.params.id}).exec();
        let date = await moment(post.date).format("MMMM Do YYYY");
        let comments = await db.model('posts', commentSchema, 'comments')
        .find({postid : req.params.id}).exec();
        if(!comments){
            comments = [];
        }
        res.render('post',{
            nav,
            title: "Ekubo mo Abata",
            page_heading: "えくぼもあばた",
            sub_heading: "by Kenji Wilkins",
            post,
            date,
            comments,
            id,
            logininfo
        });
    }
    catch(err) {
        next(err);
    }
});
postRouter.route('/send')
    .post( async(req, res, next) =>{
        try{
            let comment = await db.model('posts', commentSchema, 'comments');
            await comment.create({ name: req.body.commenterName, body: req.body.commentBody, postid: req.body.postId }, (err) =>{
                if(err) console.log(err);
            });
            return Promise.resolve(res.redirect('/post/' + req.body.postId));
        }
        catch(err){
            next(err);
        }
    })

module.exports = postRouter;