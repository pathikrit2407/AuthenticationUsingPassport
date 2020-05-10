const isAuth = (req ,res , next)=>{
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('error_msg','Please log in to view resources')
    res.redirect('/login')
}


module.exports = {
    isAuth
}