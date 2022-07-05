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

const upload = multer({ storage });
const requireLogin = async(req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/');
    }
    next();
}
const secret = 'thisshouldbeabettersecret!';


const store = new MongoStore({
    mongoUrl: dburl,
    ttl: 60 * 60,
    autoRemove: 'native',
    user_id:null,
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})
let ses = 
    session({
        saveUninitialized: false,
        secret:secret,
        resave: false,
        store: store,
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
    res.render("register.ejs", { errorMessage: "", username: "" });
});

router.post(
    "/register",
    catchAsync(async (req, res) => {
        const { username, password, cpassword } = req.body;

        if (password === cpassword) {
            const user = new User({ username, password });
            await user.save();
            req.session.user_id = user._id;
            res.redirect("/dashboard");
        } else {
            res.render("register", {
                errorMessage: "Password didn't matched",
                username: username,
            });
        }
    })
);


router.post(
    "/login",
    catchAsync(async (req, res) => {
        const { username, password } = req.body;
        const foundUser = await User.findAndValidate(username, password);
        if (foundUser) {
            req.session.user_id = foundUser._id;
            res.redirect("/dashboard");
        } else {
            res.redirect("/login");
        }
    })
);

router.post(
    "/logout",
    catchAsync(async (req, res) => {
        req.session.user_id = null;
        res.redirect("/");
    })
);

router.use(requireLogin)
router.get(
    "/dashboard",
    catchAsync(async (req, res) => {
        res.render("dashboard.ejs");
    })
);

router.get(
    "/subjects",
    catchAsync(async (req, res) => {
        const subjects = await Subject.find({});
        res.render("dashboard_subjects.ejs", { subjects });
    })
);

router.get(
    "/subjects/new",
    catchAsync(async (req, res) => {
        res.render("dashboard_new_sub.ejs");
    })
);

router.post("/subjects", async (req, res) => {
    const subject = new Subject(req.body);
    await subject.save();
    res.redirect(`/subjects`);
});

router.get(
    "/subjects/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;

        const subject = await Subject.findById(id);
        res.render("subject.ejs", { subject });
    })
);

router.delete("/subjects/:id", async (req, res) => {
    const { id } = req.params;
    console.log(id);
    await Subject.findByIdAndDelete(id);
    res.redirect("/subjects");
});

router.get(
    "/subjects/:id/plan",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const subject = await Subject.findById(id).populate("plan");
        console.log(subject.plan.week);
        res.render("table.ejs", { subject });
    })
);

router.get(
    "/subjects/:id/plan/new",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const subject = await Subject.findById(id);
        console.log(subject.name);
        res.render("create.ejs", { subject });
    })
);

router.post(
    "/subjects/:id/plan",
    catchAsync(async (req, res, next) => {
        const subject = await Subject.findById(req.params.id);
        const plan = new Plan(req.body);
        subject.plan.push(plan);
        await plan.save();
        await subject.save();
        console.log(req.body);
        res.redirect(`/`);
        console.log("hurrayyyy");
    })
);

router.get(
    "/subjects/:id/plan/:planId/edit",
    catchAsync(async (req, res, next) => {
        const { id, planId } = req.params;
        const subject = await Subject.findById(id);
        const plan = await Plan.findById(planId);
        console.log(plan);
        res.render(`edit_plan.ejs`, { subject, plan });
    })
);

router.put(
    "/subjects/:id/plan/:planId",
    catchAsync(async (req, res) => {
        console.log("gg");
        const { id, planId } = req.params;

        // await Subject.findByIdAndUpdate(id, {...req.body });
        await Plan.findByIdAndUpdate(planId, { ...req.body });
        res.redirect(`/subjects/${id}/plan`);
    })
);

// router.put('/subjects/:id/plan',catchAsync(async)

router.get(
    "/subjects/:id/assignment",
    catchAsync(async (req, res) => {
        const { id } = req.params;

        const subject = await Subject.findById(id).populate("assignments");
        console.log(subject.assignments.title);

        res.render("assignments.ejs", { subject });
    })
);

router.get(
    "/showass",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const ass = await Assignment.find();
        console.log(ass);

        res.render("showpage.ejs", { ass });
    })
);

router.get(
    "/subjects/:id/assignment/new",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const subject = await Subject.findById(id);
        res.render("new_assignment.ejs", { subject });
    })
);

router.post(
    "/subjects/:id/assignment",
    catchAsync(async (req, res, next) => {
        const subject = await Subject.findById(req.params.id);
        const assignment = new Assignment(req.body);
        subject.assignments.push(assignment);
        await assignment.save();
        await subject.save();
        console.log(req.body);
        res.redirect(`/subjects/${subject._id}/assignment`);
    })
);

router.get(
    "/subjects/:id/resources",
    catchAsync(async (req, res) => {
        res.render("resources.ejs");
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
        res.render("upload_resource.ejs", { subject });
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

router.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

module.exports = router;
