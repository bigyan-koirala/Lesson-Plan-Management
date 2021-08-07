const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Assignment = require('./assignments');
const Resource = require('./resources');
const Schema = mongoose.Schema;


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

    subcode: {
        type: String
    }
})

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;