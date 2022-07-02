if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express')
const app = express();
const path = require('path')

const methodOverride = require('method-override')
const MongoStore = require("connect-mongo");
const session = require('express-session');
const bodyParser = require('body-parser')
const dburl = process.env.DB_url || 'mongodb://localhost:27017/dummy';
const mongoose = require('mongoose')

const route = require('./routes/route')
    // 'mongodb://localhost:27017/dummy'
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});



app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


const store = new MongoStore({
    mongoUrl: dburl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})
app.use(
    session({
        store: store,
        secret
    })
);
app.use(methodOverride('_method'))


app.use(route)
const requireLogin = async(req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    next();
}

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error.ejs', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
