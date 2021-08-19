if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const app = express();
const path = require('path')
const User = require('./models/user.js')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs');
const session = require('express-session');

const Subject = require('./models/subjects.js')
const Assignment = require('./models/assignments');
const Resource = require('./models/resources');
const Plan = require('./models/lessonplan.js');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const crypto = require('crypto');
const multer = require('multer');
const { storage } = require('./cloudinary/index')
const upload = multer({ storage });


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/dummy', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(express.static('public'))
    // app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'sessionsecret' }))
app.use(methodOverride('_method'))

const requireLogin = async(req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    next();
}



app.get('/register', (req, res) => {
    res.render('register.ejs');
})


app.post('/register', catchAsync(async(req, res) => {
    const { password, username } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/login')
}))

app.get('/login', catchAsync(async(req, res) => {
    res.render('login.ejs');
}))



app.post('/login', catchAsync(async(req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/dashboard');
    } else {
        res.redirect('/login')
    }
}))


app.post('/logout', catchAsync(async(req, res) => {
    req.session.user_id = null;
    res.redirect('/');
}))

app.get('/', catchAsync(async(req, res) => {
    res.render('home.ejs');
}))

app.get('/dashboard', catchAsync(async(req, res) => {
    res.render('home1.ejs');
}))



app.get('/subjects', requireLogin, catchAsync(async(req, res) => {
    const subjects = await Subject.find({});
    console.log(subjects)
    res.render('subjects', { subjects })
}))

app.get('/subjects/new', catchAsync(async(req, res) => {
    res.render('new.ejs')

}))


app.post('/subjects', async(req, res) => {
    //console.log(req.body)
    const subject = new Subject(req.body);
    await subject.save();
    res.redirect(`/subjects`)

})



app.get('/subjects/:id', catchAsync(async(req, res) => {
    const { id } = req.params

    const subject = await Subject.findById(id);
    res.render('view1.ejs', { subject })
}))

app.delete('/subjects/:id', async(req, res) => {

    const { id } = req.params;
    console.log(id);
    await Subject.findByIdAndDelete(id);
    res.redirect('/subjects');
})

// app.get('/subjects/:id/plan', catchAsync(async(req, res) => {
//     const { id } = req.params;
//     const subject = await Subject.findById(id);
//     if (subject.subcode === 'a') {
//         res.render('plans/softwareengineering.ejs');
//     }
//     if (subject.subcode === 'b') {
//         res.render('plans/graphics.ejs');
//     }
//     if (subject.subcode === 'c') {
//         res.render('plans/stats.ejs');
//     }
//     if (subject.subcode === 'd') {
//         res.render('plans/english.ejs');
//     }
//     if (subject.subcode === 'e') {
//         res.render('plans/coa.ejs');
//     }
//     if (subject.subcode === 'f') {
//         res.render('plans/dc.ejs');
//     }
//     if (subject.subcode === 'g') {
//         res.render('plans/instrumentation.js');
//     }

//     console.log(subject.subcode)


// }))

app.get('/subjects/:id/plan', catchAsync(async(req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate('plan');
    console.log(subject.plan.week)
    res.render('plan.ejs', { subject })


}))

app.get('/subjects/:id/plan/new', catchAsync(async(req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    console.log(subject.name)
    res.render('createplan.ejs', { subject })


}))

app.post('/subjects/:id/plan', catchAsync(async(req, res, next) => {

    const subject = await Subject.findById(req.params.id);
    const plan = new Plan(req.body);
    subject.plan.push(plan);
    await plan.save();
    await subject.save();
    console.log(req.body)
    res.redirect(`/`);
    console.log('hurrayyyy')

}))


app.get('/subjects/:id/assignment', catchAsync(async(req, res) => {
    const { id } = req.params

    const subject = await Subject.findById(id).populate('assignments');
    console.log(subject.assignments.title)

    res.render('assignments.ejs', { subject })
}))

app.get('/subjects/:id/assignment/new', catchAsync(async(req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    res.render('ass.ejs', { subject })
}))

app.post('/subjects/:id/assignment', catchAsync(async(req, res, next) => {

    const subject = await Subject.findById(req.params.id);
    const assignment = new Assignment(req.body);
    subject.assignments.push(assignment);
    await assignment.save();
    await subject.save();
    console.log(req.body)
    res.redirect(`/subjects/${subject._id}/assignment`);

}))


app.get('/subjects/:id/resources', catchAsync(async(req, res) => {
    res.render('uploads.ejs')

}))

app.post('/subjects/:id/resources', upload.array('file'), catchAsync(async(req, res) => {
    const subject = await Subject.findById(req.params.id);

    const resources1 = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const files = new Resource(resources1);
    subject.resources.push(files);
    await files.save();
    await subject.save();
    res.redirect(`/subjects/${subject._id}/resources`);
    console.log(files);

    console.log(subject);

}))

app.get('/subjects/:id/resources/new', catchAsync(async(req, res) => {
    const subject = await Subject.findById(req.params.id)
    res.render('upload.ejs', { subject })
}))

app.delete('/subjects/:id/assignment/:assignmentId', catchAsync(async(req, res) => {
    const { id, assignmentId } = req.params;
    await Subject.findByIdAndUpdate(id, { $pull: { assignments: assignmentId } });
    await Assignment.findByIdAndDelete(assignmentId);
    res.redirect(`/subjects/${id}/assignment`);
}))


app.get('/calendar', catchAsync(async(req, res) => {
    res.render('calendar1.ejs');
}))


// app.post('/subjects/:id/assignment', upload.single('image'), (req, res) => {
//     console.log(req.body)
//     console.log(req.file)
//     res.send(req.body)
// })


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("Server Started");
})