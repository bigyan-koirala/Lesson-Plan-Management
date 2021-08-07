const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const resourceSchema = new mongoose.Schema({

    file: [{

        url: String,
        filename: String
    }]
})
const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;