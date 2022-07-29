const Subject = require("../models/subjects");
const Assignment = require("../models/assignments");


// exports.listAssignment = async(req, res) => {
//     try{
//         const { id } = req.params;
//         const ass = await Assignment.find();

//         res.render("dashboard_assignments.ejs", { ass });
//     }catch(err){
//         console.log(err);
//         return res.render("dashboard_assignments.ejs", {ass: null});
//     }
// }


exports.getAssignment = async(req, res) => {
    try{
        const { id } = req.params;

        const subject = await Subject.findById(id).populate("assignments");

        res.render("dashboard_assignments.ejs", { subject });
    }catch(err){
        console.log(err);
        return res.render("dashboard_assignments.ejs");
    }
}

exports.createAssignment = async(req, res) => {
    try{
        const subject = await Subject.findById(req.params.id);
        const assignment = new Assignment(req.body);
        subject.assignments.push(assignment);
        await assignment.save();
        await subject.save();
        console.log(req.body);
        res.redirect(`/subjects/${subject._id}/assignment`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}