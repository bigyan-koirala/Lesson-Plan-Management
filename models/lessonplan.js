const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const planSchema = new mongoose.Schema({
    week: {
        type: String,
        // required: true
    },
    objectives: {
        type: String,
        // required: true
    },
    sunday: {
        type: String,
        // required: true
    },
    monday: {
        type: String,
        // required: true
    },
    tuesday: {
        type: String,
        // required: true
    },
    wednesday: {
        type: String,
        // required: true
    },
    thursday: {
        type: String,
        // required: true
    },
    friday: {
        type: String,
        // required: true
    }



})
const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;