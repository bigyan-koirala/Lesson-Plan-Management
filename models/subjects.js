const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Assignment = require('./assignments');
const Resource = require('./resources');
const Schema = mongoose.Schema;
const Plan = require('./lessonplan')


const subjectSchema = new Schema({


    name: {
        type: String
    },

    assignments: [{
        type: Schema.Types.ObjectId,
        ref: 'Assignment'
    }],

    image: {
        type: String
    },

    resources: [{
        type: Schema.Types.ObjectId,
        ref: 'Resource'
    }],

    plan: [{
        type: Schema.Types.ObjectId,
        ref: 'Plan'
    }],


    subcode: {
        type: String
    }
})

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;