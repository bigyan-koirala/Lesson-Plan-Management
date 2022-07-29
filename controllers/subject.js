const Subject = require("../models/subjects");
const User = require("../models/user");
const Plan = require("../models/plan");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getSubject = async(req, res) => {
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        const subjects = await Subject.find({_id: {$in: currentUser.subjects}});
        res.render("dashboard_subjects.ejs", { subjects });
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard")
    }
}

exports.getSubjectById = async(req, res) => {
    try{
        const { id } = req.params;
        
        const currentUser = await User.findById(req.session.user_id);
        if(currentUser.subjects.includes(id)){
            const subject = await Subject.findById(id);
            return res.render("dashboard_subject.ejs", { subject });
        }
        return res.render("dashboard.ejs");
    }catch(err){
        return res.render("dashboard.ejs");
    }
}


exports.createSubject = async(req, res) => {
    const {name} = req.body;
    try{
        const currentUser = await User.findById(req.session.user_id);

        const plan = new Plan();
        const newPlan = await plan.save();
        
        const subject = new Subject({name, plan: newPlan._id});
        const newSubject = await subject.save();
        
        await User.updateOne({_id: req.session.user_id}, {$push: { subjects: newSubject._id}})
        currentUser.update()
        res.redirect(`/subjects`);
    }catch(err){
        console.log(err);
        return res.redirect("/subjects/new")
    }
}

exports.deleteSubject = async(req, res) => {
    const {subjectId} = req.params;

    try{
        const currentUser = await User.findById(req.session.user_id);
        if(!currentUser.subjects.includes(subjectId)) return res.render("dashboard");

        const currentSubject = await Subject.findById(subjectId);
        await Subject.deleteOne({"_id": ObjectId(subjectId)});
        await Plan.deleteOne({"_id": ObjectId(currentSubject.plan)})
        
        return res.redirect("/subjects/")
    }catch(err){
        console.log(err);
        return res.render("dashboard");
    }

}