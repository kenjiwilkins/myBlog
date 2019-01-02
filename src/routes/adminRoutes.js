const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const adminRouter = express.Router();
require('dotenv').config();
const uri = process.env.DB_URI;

const posts = [
    {
        title: "高樹のぶ子「透光の樹」",
        date: new Date("2018-01-04"),
        postBody: "純粋な愛を想像するとどうして人は笑ってしまうのでしょうか。やはりみんなそんなものはありえないのだと思っているからなのかもしれません。しかし日本のポップソングの歌詞に氾濫する愛の言葉の数々はどうしてそれを信じてもいない人々の口を伝っていくのでしょうか。日本人は自らの国民性を謙虚だと第一に挙げる方々が多いように思いますが、内心では自らこそが主人公、物語の中心だと信じている人がとても多いのではないでしょうか。",
        author: "Kenji Wilkins",
        Category: "Novel"
    },
    {
        title: "ギドモーパッサン「脂肪の塊」",
        date: new Date("2017-09-12"),
        postBody: "共感性羞恥という言葉を最近よく聞くようになった。たとえば映画のなかで主人公やほかの登場人物が公に辱められるシーンで、そのひとに自らを無意識のうちに投影してしまい、その後すぐに辱められることがわかっているだけに、もう避けようもないところにいたたまれなくなってしまうことだ。僕自身そういうところがある。主人公がこうむる肉体的な痛みは見ていていっこうに平気なのに精神的恥辱は見ることが、たとえそれが物語の筋のうえでどうしても必要なものだとわかっていてもつらくなる。",
        author: "Kenji Wilkins",
        Category: "Novel"
    }
];


function router(nav){
    adminRouter.route('/')
        .get((req, res) => {
            const url = 'mongodb://localhost:27017';
            const dbName = 'myBlogApp';

            const client = new MongoClient(uri, { useNewUrlParser: true });
                
                client.connect(err =>{
                    const collection = client.db("posts").collection("blogPosts").insertMany(posts);
                    console.log('connected!!');
                    res.json(collection);   
                    client.close();
                });
            
        });
    
    adminRouter.route('/test')
        .get((req, res) => {
            MongoClient.connect(uri, function(err, client){
                if(err){
                    console.log('error occurred while connecting to mongodb\n', err);
                }
            console.log('connceted...');
            const collection = client.db("test").collection("devices");
            client.close();
            })
        })

    return adminRouter;
};

module.exports = router;