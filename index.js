var express = require('express')
var jwt = require('jsonwebtoken')

var bcrypt = require('bcrypt')



var multer = require('multer')

//Configuration
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })


var {MongoClient,ObjectId} = require('mongodb')
var mongoserver = new MongoClient('mongodb://hamza2451999_db_user:JOSBZS7RI0FbWmZF@ac-gktqdpz-shard-00-00.0pbxr4w.mongodb.net:27017,ac-gktqdpz-shard-00-01.0pbxr4w.mongodb.net:27017,ac-gktqdpz-shard-00-02.0pbxr4w.mongodb.net:27017/?ssl=true&replicaSet=atlas-b8xwau-shard-0&authSource=admin&appName=HamzaCluster')
mongoserver.connect()


var server = express()
server.use(express.json())

//REST APIs

//PUBLIC APIs
var secretkey = "abc123"


//File Uploading
server.post('/uploadfile',upload.array('files',10),async(req,res) =>{
    var myfile = req.files;

    if(myfile != null)
    {
        // var query = await mongoserver.db('testdb').collection('gallery').insertOne({"imagepath":myfile.path})
        // if(query)
        // {
        console.log(myfile.length)
        res.send()
        // }
        // else
        // {
        //     res.json({"Error":"Could not insert file to database"})
        // }
    }
    else
    {
        res.json({"Error":"No File Uploaded"})
    }

})




//1. GET (request, response)
server.get('/users',async(req,res) => {
   
         
          var query = await mongoserver.db('testdb').collection('users').find().toArray()
          res.json({query})
   

})

server.post('/register',async(req,res) =>{
    var data = req.body;
    var hashedpassword = bcrypt.hash(data.password,10)
    await mongoserver.db('testdb').collection('users').insertOne({
        "name":data.name,
        "email":data.email,
        "password":(await hashedpassword).toString()
    })
    
    res.json({"Exposed Pass":data.password,"Hashed":(await hashedpassword).toString()})
})

//Middleware
function auth(req,res,next)
{
 var token = req.headers.authorization
    if(token)
    {
       jwt.verify(token,secretkey)
       next()
    }
    else
    {
        res.json({"Error":"No Token Found"})
    }
}


//Login API
server.post('/login',async(req,res) =>{
    var data = req.body

    //user ka password
    var normalpassword = data.password;

    //database se record check
    var user = await mongoserver.db('testdb').collection('users').findOne({"email":data.email})

    if(user)
    {
        var ismatched = await bcrypt.compare(normalpassword,user.password)
        //password check karen
        if(ismatched)
        {
            var token = jwt.sign({useremail:data.email},secretkey)
        res.json({"Success":"Login Successfull","usertoken":token})
        }
        else
        {
            res.json({"error":"password does not match"})
        }
    }
    else
    {
        res.json({"Error":"Invalid Credentials"})
    }
})


//2.Post
server.post('/adduser',async(req,res) =>{
var data =  req.body
var query = await mongoserver.db('testdb').collection('users').insertOne(data)
if(query)
{
    res.json({"Success":"Data Inserted"})
}
else
{
    res.json({"Error":"Data Could not be inserted"})
}
})

//3.Delete API
server.delete('/delete',async(req,res) =>{
    var userid = req.query.id;
    if(userid == "")
    {
        res.json({"Error":"ID is empty"})
    }
    else
    {
       var query = await mongoserver.db('testdb').collection('users').deleteOne({ "_id": new ObjectId(userid) })
       if(query)
       {
        res.json({"Success":"Record Deleted"})
       }
       else
       {
        res.json({"error":"could not delete the record"})
       }
    }
})


//PRIVATE APIs
var apikey = 'api12345'
server.get('/privateapi', async(req,res) =>{
    var userinput = req.query.pass
    if(userinput == apikey)
    {
         res.json({"Error":"Key Matched"})
    }
    else
    {
        res.json({"Error":"Invalid Key"})
    }
})

server.listen(5000,()=>{
    console.log('Server is running')
})