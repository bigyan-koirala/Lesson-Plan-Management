const express = require('express')
const app = express();
const path = require('path')
    //const User = require('../models/user.js')
const Subject = require('../models/subjects.js')
const Assignment = require('../models/assignments.js')


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/dummy', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const subjects = [
    'Software Engineering',
    'Computer Graphics',
    'Probability and Statistics',
    'Communication English',
    'Computer Organization and Architecture',
    'Data Communication',
    'Instrumentation 2'
];
// const images = [
//     'https://static.javatpoint.com/tutorial/software-engineering/images/software-engineering-introduction.png',
//     'https://images.squarespace-cdn.com/content/v1/5d7b6b83ace5390eff86b2ae/1568400608914-FQOE1RUCJSOKWF2GEUXT/ray_tracing.jpg?format=1500w',
//     'https://statanalytica.com/blog/wp-content/uploads/2019/09/probability-vs-statistics.jpg',
//     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5tHcyB-PMnp2B36VXsSTLFe5pqBU6WfafMg&usqp=CAU',
//     'https://www.intel.com/content/dam/www/public/us/en/images/photography-consumer/rwd/adobestock-rwd.jpg.rendition.intel.web.864.486.jpg',
//     'https://d3mxt5v3yxgcsr.cloudfront.net/courses/1948/course_1948_image.png',
//     'https://www.cpengineering.co.uk/wp/wp-content/uploads/2019/02/instrumentation-control.jpg'
// ]
const subcode = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g'
]
const seedDB = async() => {
    await Subject.deleteMany({});
    for (let i = 0; i < 7; i++) {
        //const random1000 = Math.floor(Math.random() * 1000);
        const subject = new Subject({
            name: `${subjects[i]}`,
            subcode: `${subcode[i]}`

        })
        await subject.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})