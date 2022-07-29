const Plan = require('../models/plan');
const Subject = require("../models/subjects");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.createWeek = async(req, res) => {
    const {subjectId} = req.body;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId});
        if(!currentSubject) return res.render("dashboard");
        const currentPlan = await Plan.findById(currentSubject.plan);
        const weeks = currentPlan.weeks.length + 1;

        await Plan.findOneAndUpdate({_id: currentSubject.plan}, {$push: {weeks: {number: weeks, subject: []}}})
        //await newWeek.save();
        return res.redirect(`/subjects/${subjectId}/plan`)
    }catch(err){
        console.log(err);
        return res.send(err);
    }
}

exports.singleWeek = async(req, res) => {
    const {subjectId, weekId} = req.params;

    try{

        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentSubject = await Subject.findById(subjectId);
        if(!currentSubject){
            return res.redirect("/dashboard");
        }

        const currentPlan = await Subject.aggregate([
            { $match: { _id: ObjectId(subjectId) }},
            { $unwind: { path: "$chapters" }},
            { $replaceRoot: { newRoot: "$chapters" }},
            { $match: { "topics.week": weekId }},
            { $project: {
                "topics": {
                    "$filter": {
                        "input": "$topics",
                        "as": "topic",
                        "cond": {
                            "$eq": [ "$$topic.week", weekId]
                        }
                    }
                },
                "name": 1
            }}
        ]);

        const currentWeek = await Plan.aggregate([
            { $match: { "_id": ObjectId(currentSubject.plan) }},
            { $project: {
                "index": {
                    $indexOfArray: ["$weeks._id", ObjectId(weekId)]
                },
                "weeks": 1
            }},
            { $unwind: { path: "$weeks" }},
            { $match: { "weeks._id": ObjectId(weekId)}},
            { $project: {
                "_id": "$weeks._id",
                "index": 1,
            }}
        ])


        // const currentPlan = await Subject.aggregate([{
        //     $match: { _id: subjectId },
        //     $unwind: { path: "$chapters" },
        //     $match: { "chapters_id": chapterId },
        //     $replaceRoot: {
        //         newRoot: {
        //             "topics": "$chapters.topics",
        //             "chapter": { "name": "$chapters.name", "_id": "$chapters._id"}
        //         }
        //     },
        //     $unwind: { path: "$topics" },
        //     $match: { "topics._id": toipcId },
        //     $replaceRoot: {
        //         newRoot: {
        //             "topic": { "_id": "$topics._id", "name": "$topics.name"},
        //             "chapter": "$chapter"
        //         }
        //     }
        // }])

        console.log(currentWeek);
        return res.render("dashboard_week_edit", {
            plans: currentPlan,
            week: currentWeek[0],
            subject: JSON.stringify(currentSubject)
        });
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}

exports.addTopicToWeek = async(req, res) => {
    const {subjectId, weekId, topicId, chapterId} = req.body;
    try{
        const currentSubject = await Subject.findOneAndUpdate({
            _id: subjectId,
        }, {
            $set: { "chapters.$[chapters].topics.$[topics].week": weekId}
        },{
            "multi": false,
            "upsert": true,
            arrayFilters: [
                { "chapters._id": { "$eq": chapterId } },
                { "topics._id": { "$eq": topicId } },
            ]
        })
        return res.redirect(`/subjects/${currentSubject._id}/plan/${weekId}`)
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}

// exports.addTopicToWeek = async(req, res) => {
//     const {subjectId, chapterId, topicId} = req.body;
//     try{
//         const currentUser = await User.findById(req.session.user_id);
        
//         if(!currentUser.subjects.includes(subjectId)){
//             return res.redirect("/dashboard");
//         }

//         const currentSubject = await Subject.findOneAndUpdate({
//             _id: subjectId
//         },{

//         });
//         if(!currentSubject) return res.redirect("/dashboard");

//         console.log(currentSubject);

// //        const currentPlan = await Plan.findOneAndUpdate({_id: currentSubject.plan}, {$push: {weeks: {subject: []}}})
// //        console.log(currentPlan);
//         //await newWeek.save();
//         return res.redirect(`/subjects/${subjectId}/plan`)
//     }catch(err){
//         console.log("sss");
//         console.log(err);
//         return res.send(err);
//     }

// }

exports.listWeek = async(req, res) => {
    const subjectId = req.params.subjectId;
    try{
        // const weeks = await Week.find();
        const currentUser = await User.findById(req.session.user_id);
        const currentSubject = await Subject.findById(subjectId);
        const plan = await Plan.findById(currentSubject.plan);
        res.render("dashboard_week", {
            weeks: plan.weeks,
            subject: JSON.stringify(currentSubject)
        });
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}


exports.deleteWeek = async(req, res) => {
    const { subjectId, weekId } = req.params;

    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentSubject = await Subject.findById(subjectId);
        if(!currentSubject){
            return res.redirect("/dashboard");
        }

        const updatedPlan = await Plan.findOneAndUpdate({_id: currentSubject.plan}, {
            $pull: {
                weeks: { _id: ObjectId(weekId) }
            }
        });

        const updatedSubjects = await Subject.findOneAndUpdate({
            _id: ObjectId(currentSubject._id)
        },{
            $set: { "chapters.$[].topics.$[].week": null},
        },{
            $arrayFilters: [{ "chapters.topics.week": currentSubject._id}]
        })

        return res.redirect(`/subjects/${currentSubject._id}/plan/`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}