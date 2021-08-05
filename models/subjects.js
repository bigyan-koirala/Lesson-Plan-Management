const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Assignment = require('./assignments');
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
    resource: {
        type: String
    },
    subcode: {
        type: String
    }
})

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;