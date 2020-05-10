const express = require('express')
const path = require('path')
var bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
var bodyParser = require("body-parser")
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const  { isAuth } = require('./config/isAuth') 


//Passport config
require('./config/passport')(passport)

//User Model
const User  = require('./models/Users') 

const app = express()

const port = process.env.PORT || 3000

//EJS
app.set('view-engine','ejs')
app.set('views', path.join(__dirname, 'views'));

//bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// Use the session middleware
app.use(session({ 
    secret: 'keyboard cat', 
    resave: true,
    saveUninitialized:true
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash())

//Global Vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//=========DataBase========================

mongoose.connect("mongodb://localhost/passportjs", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology:true
    }).then(()=>{
        console.log("MongoDB connected")
    }).catch((err)=>{
        console.log(err)
    })
    
//===============ROUTES===================

//Index Page
app.get('/',(req,res)=>{
    res.render("welcome.ejs")
})


//dashboard page
app.get("/dashboard",isAuth,(req,res)=>{
    res.render("dashboard.ejs",{
        username:req.user.name
    })
})

//login Page
app.get('/login',(req,res)=>{
    res.render("login.ejs");
})


//login Handle=====Passport Authenticate
app.post('/login',(req,res,next)=>{
    const { email , password } = req.body 
    passport.authenticate('local', { 
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true })(req,res,next)
})


//Register Page
app.get('/register',(req,res)=>{
    res.render("register.ejs")
})


//Register Handle
app.post('/register',(req,res)=>{
    console.log(req.body)
    const { name , email , password , cpassword} = req.body
    console.log(password)
    console.log(cpassword)

    const errors = []

    //check passwords match
    if(password !== cpassword){
        errors.push({msg:" Password do not match " })
    }

    //check passport Length
    if(password.length < 6 ){
        errors.push({msg:"Password should be atleast 6 character "})
    }
    
    if(errors.length>0){
        console.log(errors)
        res.render('register.ejs',{errors})
    }else{
        //Validation passed
        User.findOne({email},(user)=>{
            //email exists
            if(user){
                errors.push({msg:"Email already Exists"})
                res.render('register.ejs',{errors})
            }else{
                const newUser = new User({
                    name,
                    email,
                    password
                })

              //hash password
                bcrypt.genSalt(8, function(err, salt) {
                    bcrypt.hash(newUser.password, salt, function(err, hash) {
                        // Store hash in your password DB.
                        newUser.password = hash
                        
                        //save user to db
                        newUser.save().then(()=>{
                            req.flash('success_msg','You are now registered !')
                            res.redirect('/login')
                        }).catch(err=>console.log(err))         
                    })
                })
            }
        })
    }

})

//logout
app.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg','You have successfully logged out')
    res.redirect('/login');
  });

app.listen(port,()=>{
    console.log("Listening in port "+port)
})