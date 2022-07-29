const User = require("../models/user");
const Plan = require("../models/plan");

exports.createUser = async(req, res) => {
    const { username, password, cpassword } = req.body;
    try{
        if (password === cpassword) {
            const existingUser = await User.findOne({"username": username});
            if(existingUser){
                return res.render("register", {
                    errorMessage: "Username already in taken."
                })
            };
            
            const user = new User({ username, password});
            await user.save();
            req.session.user_id = user._id;
            req.session.save();
            return res.redirect("/dashboard");
        } else {
            return res.render("register", {
                errorMessage: "Password didn't match.",
                username: username,
            });
        }
    }catch(err){
        console.log(err);
        return res.render("register", {
            errorMessage: "Unknown error occured."
        })
    }
}

exports.loginUser = async(req, res) => {
    try{
        const { username, password } = req.body;
        
        const currentUser = await User.findAndValidate(username, password);
        if (currentUser) {
            req.session.user_id = currentUser._id;
            res.redirect("/dashboard");
        } else {
            res.render("home.ejs", {
                errorMessage: "Invalid email or password."
            });
        }
        
    }catch(err){
        console.log(err);
        return res.render("home.ejs", {
            errorMessage: "Unknown error occurred."
        });
    }
}

exports.logoutUser = async(req, res) => {
    try{
        req.session.destroy();
        res.clearCookie('lpms');
        res.redirect("/");
    }catch(err){
        console.log(err);
        return res.render("home.ejs", {
            errorMessage: "Unknown error occurred."
        });
    }
}