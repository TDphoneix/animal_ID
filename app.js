require('dotenv').config()
const cloudinary = require('cloudinary').v2
const express = require('express')
const { MongoClient } = require('mongodb')
const cors = require('cors')

const uri = process.env.MONGOURI
const cloudinary_cloud = process.env.CCLOUD
const cloudinary_key = process.env.CKEY
const cloudinary_secret = process.env.CSECRET
const app = express();
const client = new MongoClient(uri)

cloudinary.config({
    cloud_name: cloudinary_cloud,
    api_key: cloudinary_key,
    api_secret: cloudinary_secret
  });

app.use(express.static("./public"))
app.use(express.json())
app.set('view engine','ejs')
app.set('views', './public/views')
app.use(cors())


app.get("/",(req,res)=>{
    res.status(300).redirect('/home.html')
})

app.post("/start", (req,res)=>{
    let data = req.body;
    console.log(data);

    getGroupInfo(data).then(value=>{
        res.json(value)
    }).catch(err=>{
        res.status(400).json({message:"error occured, couldnt find the number of specimens"})
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

    if(result_data.length < data.count){
        return error
    }

    let randomNumbers = genRandomNumbers(0, result_data.length - 1, data.count)

    for(r of randomNumbers){
        randomized_result_data.push(result_data[r])
    }
    
    randomized_result_data.forEach(a=>{
        const url = cloudinary.url(a.src.split('.')[0], {
            width: 400,
            height: 300,
            Crop: 'fill'
          });
        a.src = url
    })
    console.log(randomized_result_data)
    return randomized_result_data    
}

function genRandomNumbers(min, max, count){
    let rannums = []

    for(let i = 0; i<count; i++){
        let ran = Math.floor(Math.random()*(max - min + 1)) + min
        if(rannums.includes(ran)){
            i--
            continue
        }
        rannums.push(ran)
    }

    return rannums
}
