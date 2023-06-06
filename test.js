const cloudinary = require('cloudinary').v2;
const path = require('path')
const fs = require('fs')

const dirpath = path.join(__dirname,'public/images/')

cloudinary.config({
    cloud_name: "dbpkw1glj",
    api_key: "989942999537629",
    api_secret: "bJ-cjb33n28je-XKA1LIdQEzpvw"
  });
  

fs.readdir(dirpath,(er,files)=>{
    files.forEach(f=>{
        const res = cloudinary.uploader.upload(`./public/images/${f}`, {public_id:`${f.split('.')[0]}`})

        res.then((data) => {
          console.log(data.secure_url);
        }).catch((err) => {
          console.log(err);
        });
    })
})

// Configuration 
