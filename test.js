const cloudinary = require('cloudinary').v2;
const path = require('path')
const fs = require('fs')

const dirpath = path.join(__dirname,'public/images/')

fs.readdir(dirpath,(er,files)=>{

    files.forEach(f=>{
        const res = cloudinary.uploader.upload(`./public/images/${f}`, {public_id:`${f.split('.')[0]}`})

        res.then((data) => {
          console.log(data);
          console.log(data.secure_url);
        }).catch((err) => {
          console.log(err);
        });
    })
})

// Configuration 
cloudinary.config({
  cloud_name: "dbpkw1glj",
  api_key: "989942999537629",
  api_secret: "bJ-cjb33n28je-XKA1LIdQEzpvw"
});


// Upload




// Generate 
const url = cloudinary.url("blue_mormon", {
  width: 100,
  height: 150,
  Crop: 'fill'
});



// The output url
console.log(url);
// https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag