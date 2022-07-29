const Plan = require("../models/plan");
const Subject = require("../models/subjects");

exports.createPlan = async(req, res) => {
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