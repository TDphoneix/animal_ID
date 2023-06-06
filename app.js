require('dotenv').config()
const cloudinary = require('cloudinary').v2

const express = require('express')
const multer =require('multer')
const { MongoClient } = require('mongodb')
const cors = require('cors')

const uri = process.env.MONGOURI
const upload = multer()
const app = express();
const client = new MongoClient(uri)

cloudinary.config({
    cloud_name: "dbpkw1glj",
    api_key: "989942999537629",
    api_secret: "bJ-cjb33n28je-XKA1LIdQEzpvw"
  });

app.use(express.static("./public"))
app.use(express.json())
app.set('view engine','ejs')
app.set('views', './public/views')
app.use(cors())


app.options('*',cors({
    methods : ['GET','POST'],
    allowedHeaders : ['Content-Type']
}))

app.get("/",(req,res)=>{
    res.status(300).redirect('/home.html')
})

app.post("/start", (req,res)=>{
    let data = req.body;
    console.log(data);

    getGroupInfo(data).then(value=>{
        res.json(value)
    })
    
})

app.get('/quizinfo',(req,res)=>[
    res.render('quizbox')
])


app.listen(5000,()=>{
    console.log(`app active at http://localhost:5000/`)
})



async function getGroupInfo(data){
    await client.connect()
    console.log("successfully connected!!")

    const db = client.db('animalgroups')
    const coll = db.collection('butterflies')
    let result_data = []
    let randomized_result_data = []
    
    let result = await coll.find({family : {$in : data.groups}}, {
        projection : {
            _id : 0,
            family : 0
        }
    })

    for await (obj of result){
        result_data = result_data.concat(obj.members);
    }

    let randomNumbers = genRandomNumbers(0, result_data.length - 1, 15)

    for(r of randomNumbers){
        randomized_result_data.push(result_data[r])
    }
    console.log(randomized_result_data)
    randomized_result_data.forEach(a=>{
        const url = cloudinary.url(a.src.split('.')[0], {
            width: 400,
            height: 300,
            Crop: 'fill'
          });
        a.src = url
    })
    return randomized_result_data    
}

function genRandomNumbers(min, max, count){
    let rans = []

    for(let i = 0; i<count; i++){
        let ran = Math.floor(Math.random()*(max - min + 1)) + min
        if(rans.includes(ran)){
            i--
            continue
        }
        rans.push(ran)
    }

    return rans
}
