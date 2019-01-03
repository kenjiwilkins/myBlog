const MongoClient = require('mongodb').MongoClient;

const URI = process.env.MONGODB_URI;

function connect(url){
    return MongoClient.connect(url).then(client => client.db());
};

module.exports = async function() {
    let databases = await Promise.all(connect(URI));

    return databases;
}