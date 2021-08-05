const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    file: [{

        url: String,
        filename: String
    }]
})
const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;