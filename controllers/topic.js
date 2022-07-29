
const Subject = require("../models/subjects");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.createTopic = async(req, res) => {
    const { subjectId, chapterId, name } = req.body;
    console.log(req.body);
    
    try{
        const currentUser = await User.findById(req.session.user_id);
        if(!currentUser.subjects.includes(subjectId)) return res.render("dashboard");
        
        const chapter = {
            name
        }
        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
            $push: { "chapters.$.topics": chapter}
        });
        
        return res.redirect(`/subjects/${subjectId}/chapter`)
    }catch(err){
        console.log(err);
        return res.render("dashboard");
    }
}


exports.removeWeek = async(req, res) => {
    const { subjectId, chapterId, topicId, weekId } = req.params;

    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentSubject = await Subject.findOneAndUpdate({_id: ObjectId(subjectId)},{
            $set: { "chapters.$[chapters].topics.$[topics].week": null}
        },{
            "multi": false,
            "upsert": true,
            arrayFilters: [
                { "chapters._id": { "$eq": chapterId } },
                { "topics._id": { "$eq": topicId } },
            ]
        });


        return res.redirect(`/subjects/${currentSubject._id}/plan/${weekId}`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }

}

exports.deleteTopic = async(req, res) => {
    const { subjectId, chapterId, topicId } = req.params;
    console.log(subjectId, chapterId, topicId);
    
    try{
        const currentUser = await User.findById(req.session.user_id);
        if(!currentUser.subjects.includes(subjectId)) return res.redirect("/dashboard");
        
        const currentSubject = await Subject.findOneAndUpdate({
            _id: ObjectId(subjectId), 
            "chapters._id": ObjectId(chapterId), 
        //    "chapters.topics._id": ObjectId(topicId)
        }, {
            $pull: { "chapters.$.topics": { "_id": ObjectId(topicId) }}
        });
        
        return res.redirect(`/subjects/${subjectId}/chapter`)
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}