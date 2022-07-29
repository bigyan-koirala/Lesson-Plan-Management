const dburl = 'mongodb://127.0.0.1:27017/lpms';
const express = require("express");

const router = express.Router();
const multer = require("multer");

const session = require('express-session');
const MongoStore = require("connect-mongo");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { storage } = require("../cloudinary/index");
const bodyParser = require('body-parser')

const User = require("../models/user.js");
const Subject = require("../models/subjects.js");
const Assignment = require("../models/assignments");
const Resource = require("../models/resources");
const Plan = require("../models/lessonplan.js");

const {
    loginUser,
    createUser,
    logoutUser,
} = require("../controllers/user");

const {
    getSubject,
    getSubjectById,
    createSubject,
    deleteSubject,
} = require("../controllers/subject");

const {
    getChapter,
    createChapter, 
    deleteChapter,
} = require("../controllers/chapter");

const {
    getAssignment, createAssignment,
    //    listAssignment,
} = require("../controllers/assignment");

const {
    listWeek,
    createWeek,
    singleWeek,
    addTopicToWeek,
    deleteWeek,
} = require('../controllers/week');

// const {
    //     createPlan,
    // } = require("../controllers/plan.js");
    
const {
    createTopic,
    removeWeek,
    deleteTopic,
} = require("../controllers/topic");
    
const upload = multer({ storage });

const requireLogin = async(req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/');
    }
    next();
}



const secret = 'thisshouldbeabettersecret!';


const store = new MongoStore({
    mongoUrl: dburl,
    ttl: 24*60*60,
    autoRemove: 'native',
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})
let ses = 
    session({
        saveUninitialized: false,
        secret:secret,
        name:'lpms',
        resave: false,
        sameSite: true,
        store: store,
        maxAge:24*60*60,
    })
router.use(ses)
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.get(
    "/",
    catchAsync(async (req, res) => {
        res.render("home.ejs", { errorMessage: "" });
    })
);

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.use(requireLogin)


router.post("/week/create", createWeek)
router.get("/subjects/:subjectId/plan", listWeek);
router.get("/subjects/:subjectId/plan/:weekId", singleWeek);
router.get("/subjects/:subjectId/plan/:weekId/delete", deleteWeek);

router.post("/chapter/create", createChapter);
router.get("/subjects/:subjectId/chapter", getChapter);
router.get("/subjects/:subjectId/chapter/:chapterId/delete", deleteChapter);

router.post("/topic/create", createTopic);
router.post("/week/addtopic", addTopicToWeek);
router.get("/subjects/:subjectId/chapter/:chapterId/:topicId/delete", deleteTopic);


router.get(
    "/dashboard",
    catchAsync(async (req, res) => {
        res.render("dashboard.ejs");
    })
);

router.get("/subjects", getSubject);

router.get(
    "/subjects/new",
    catchAsync(async (req, res) => {
        res.render("dashboard_new_sub.ejs");
    })
);

router.post("/subjects", createSubject);
router.get("/subjects/:id", getSubjectById);

router.get("/subjects/:subjectId/delete", deleteSubject);
router.get("/subjects/:subjectId/chapter/:chapterId/topic/:topicId/:weekId/removeweek", removeWeek);

// router.put('/subjects/:id/plan',catchAsync(async)

router.get("/subjects/:id/assignment", getAssignment);
//router.get("/listassignment", listAssignment);

router.get(
    "/subjects/:id/assignment/new",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const subject = await Subject.findOne({"_id": id});
        res.render("dashboard_new_assignment.ejs", { subject });
    })
);

router.post("/subjects/:id/assignment", createAssignment);

router.get(
    "/subjects/:id/resources",
    catchAsync(async (req, res) => {
        res.render("dashboard_resources.ejs");
    })
);

router.post(
    "/subjects/:id/resources",
    upload.array("file"),
    catchAsync(async (req, res) => {
        const subject = await Subject.findById(req.params.id);

        const resources1 = req.files.map((f) => ({
            url: f.path,
            filename: f.filename,
        }));
        const files = new Resource(resources1);
        subject.resources.push(files);
        await files.save();
        await subject.save();
        res.redirect(`/subjects/${subject._id}/resources`);
        console.log(files);

        console.log(subject);
    })
);

router.get(
    "/subjects/:id/resources/new",
    catchAsync(async (req, res) => {
        const subject = await Subject.findById(req.params.id);
        res.render("dashboard_upload_resource.ejs", { subject });
    })
);

router.delete(
    "/subjects/:id/assignment/:assignmentId",
    catchAsync(async (req, res) => {
        const { id, assignmentId } = req.params;
        await Subject.findByIdAndUpdate(id, {
            $pull: { assignments: assignmentId },
        });
        await Assignment.findByIdAndDelete(assignmentId);
        res.redirect(`/subjects/${id}/assignment`);
    })
);

router.get(
    "/calendar",
    catchAsync(async (req, res) => {
        res.render("dashboard_calendar.ejs");
    })
);

// router.post('/subjects/:id/assignment', upload.single('image'), (req, res) => {
//     console.log(req.body)
//     console.log(req.file)
//     res.send(req.body)
// })

// router.all("*", (req, res, next) => {
//     next(new ExpressError("Page Not Found", 404));
// });

// router.get(
//     "/subjects/:id/plan",
//     catchAsync(async (req, res) => {
//         const { id } = req.params;
//         const subject = await Subject.findById(id).populate("plan");
//         console.log(subject.plan.week);
//         res.render("dashboard_table.ejs", { subject });
//     })
// );

// router.get(
//     "/subjects/:id/plan/new",
//     catchAsync(async (req, res) => {
//         const { id } = req.params;
//         const subject = await Subject.findById(id);
//         console.log(subject.name);
//         res.render("dashboard_create.ejs", { subject });
//     })
// );

// router.post(
//     "/subjects/:id/plan",
//     catchAsync(async (req, res, next) => {
//         const subject = await Subject.findById(req.params.id);
//         const plan = new Plan(req.body);
//         subject.plan.push(plan);
//         await plan.save();
//         await subject.save();
//         console.log(req.body);
//         res.redirect(`/`);
//         console.log("hurrayyyy");
//     })
// );

// router.get(
//     "/subjects/:id/plan/:planId/edit",
//     catchAsync(async (req, res, next) => {
//         const { id, planId } = req.params;
//         const subject = await Subject.findById(id);
//         const plan = await Plan.findById(planId);
//         console.log(plan);
//         res.render(`dashboard_edit_plan.ejs`, { subject, plan });
//     })
// );

// router.put(
//     "/subjects/:id/plan/:planId",
//     catchAsync(async (req, res) => {
//         console.log("gg");
//         const { id, planId } = req.params;

//         // await Subject.findByIdAndUpdate(id, {...req.body });
//         await Plan.findByIdAndUpdate(planId, { ...req.body });
//         res.redirect(`/subjects/${id}/plan`);
//     })
// );


module.exports = router;
