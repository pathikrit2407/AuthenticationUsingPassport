const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
Date:{
    type:Date,
    default:Date.now
}
})

const User = mongoose.model('User',UserSchema)

//seeding the database
// const kitty = new User({ name: 'pat' ,email:"pat@gmail.com" , password:"qwerty" , Date:Date().now});
// kitty.save().then(() => console.log('meow'));


module.exports = User