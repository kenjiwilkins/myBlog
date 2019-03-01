const express = require("express");
const path = require('path');
const moment = require('moment');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Strategy } = require('passport-local');

const app = express();
const nav = require('./src/dbs/nav');

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

const userSchema = new Schema({
    name: String,
    password: String,
    administrator: Boolean
});
let loginuser;

app.use(cookieParser());
app.use(session({ resave: false, saveUninitialized:false, secret: 'nothing really',
    cookie: {
        secure: false,
        maxAge: 3600000
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

db.on('error', console.error.bind(console, 'connection error:'));

passport.use(new Strategy( 
    async (username, password, done) => {
        try{
            await db.model('posts', userSchema, 'users')
            .findOne({userName: username}, (err, user) => {
                if(err){
                    return done(err);
                }
                if(!user){
                    return done(null, false);
                }
                let userObject = user.toObject();
                if(userObject.password != password){
                    return done(null, false);
                }
                
                loginuser = userObject;
                return done(null, user);
            })
        } catch(err) {
            console.log(err);
        }
    }
))

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
const searchRouter = require('./src/routes/searchRoutes');
app.use('/search', searchRouter);

app.get('/', (async (req, res, next) => {
    try{
        let pagenation = {
            older : true,
            newer : false,
            currentPage : 1
        };
        let logininfo = {
            login : false,
            userinfo : {}
        };
        let currentPage = 1;
        let posts = await db.model('posts', blogSchema, 'blogPosts')
            .find().sort('-date').skip(currentPage*4-4).limit(4).exec();
        let dates = [];
        let check = await db.model('posts', blogSchema, 'blogPosts');
        if(check.countDocuments < pagenation.currentPage*4+8){pagenation.older = false}
        if(pagenation.currentPage <= 1){pagenation.newer = false}
        await posts.forEach(post => {
            dates.push(moment(post.date).format("MMMM Do YYYY"));
        });
        if(req.user){ 
            logininfo.login = true;
            logininfo.userinfo = req.user.toObject(); 
        };
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
}));

app.post('/', passport.authenticate('local', {failureRedirect:'/failed' }),
    (req, res) => {
        res.redirect('/');
    }
)

app.get('/about', (req, res) => {
    res.render('about', {
        nav,
        title: "About this blog",
        page_heading: "えくぼもあばた",
        sub_heading: "by Kenji Wilkins"
    })
})

app.get('/service', (req, res) => {
    res.render('about', {
        nav,
        title: 'Service',
        page_heading: "えくぼもあばた",
        sub_heading: "by Kenji Wilkins"
    })
})

app.get('/contact', (req, res) => {
    res.render('about', {
        nav,
        title: 'Service',
        page_heading: "えくぼもあばた",
        sub_heading: "by Kenji Wilkins"
    })
})

app.get('/failed', (req, res) => {
    res.send(`User not authenticated`);
})

passport.serializeUser( (user, cb) => {
    cb(null, user);
});

passport.deserializeUser( async (id, cb) => {
    try{
        await db.model('posts', userSchema, 'users').findById(id, (err, user) => {
            cb(err, user);
        })
    } catch(err) {
        console.log(err);
    }
})

app.listen(port);