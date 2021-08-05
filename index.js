const express = require('express')
const app = express();
const path = require('path')
const User = require('./models/user.js')
const bodyParser = require('body-parser')
    //const methodOverride = require('method-override')
const bcrypt = require('bcryptjs');
const session = require('express-session');

const Subject = require('./models/subjects.js')
const Assignment = require('./models/assignments');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

var multer = require('multer');
var upload = multer({ dest: 'uploads/' })


// var storage = multer.diskStorage({
//         destination: function(req, file, cb) {
//             cb(null, './public/uploads/'); // Make sure this folder exists
//         },
//         filename: function(req, file, cb) {
//             var ext = file.originalname.split('.').pop();
//             cb(null, file.fieldname + '-' + Date.now() + '.' + ext);

//         }
//     }),
//     upload = multer({ storage: storage }).single('image');


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/dummy', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(express.static('public'))
    // app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'sessionsecret' }))
    //app.use(methodOverride('_method'))

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
        res.redirect('/');
    } else {
        res.redirect('/login')
    }
}))


app.post('/logout', catchAsync(async(req, res) => {
    req.session.user_id = null;
    res.redirect('/login');
}))

app.get('/', catchAsync(async(req, res) => {
    res.render('home.ejs');
}))


app.get('/subjects', requireLogin, catchAsync(async(req, res) => {
    const subjects = await Subject.find({});
    res.render('subjects', { subjects })
}))

app.get('/subjects/:id', catchAsync(async(req, res) => {
    const { id } = req.params

    const subject = await Subject.findById(id);
    res.render('view1.ejs', { subject })
}))

app.get('/subjects/:id/plan', catchAsync(async(req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (subject.subcode === 'a') {
        res.render('plans/softwareengineering.ejs');
    }
    if (subject.subcode === 'b') {
        res.render('plans/graphics.ejs');
    }
    if (subject.subcode === 'c') {
        res.render('plans/stats.ejs');
    }
    if (subject.subcode === 'd') {
        res.render('plans/english.ejs');
    }
    if (subject.subcode === 'e') {
        res.render('plans/coa.ejs');
    }
    if (subject.subcode === 'f') {
        res.render('plans/dc.ejs');
    }
    if (subject.subcode === 'g') {
        res.render('plans/instrumentation.js');
    }
    // res.render('plans/stats.ejs')


}))

app.get('/subjects/:id/assignment', catchAsync(async(req, res) => {
    const { id } = req.params
    const subject = await Subject.findById(id).populate('assignments');

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
    res.redirect(`/subjects/${subject._id}/assignment`);

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