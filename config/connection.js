const mongoClient = require('mongodb').MongoClient

const state = {
    db: null
}

module.exports.connect = (done)=>{
    const url = `mongodb+srv://asifazad:${process.env.mongoPassword}@shopkart.vfltt.mongodb.net/shopKart?retryWrites=true&w=majority`
    const dbname = 'shopKart'

    mongoClient.connect(url,(err,data)=>{
    if(err){
      return done(err);
    }
    state.db = data.db(dbname)
    done()
  })

}

module.exports.get = ()=>{
    return state.db
}