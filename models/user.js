const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cant be empty']
    },
    subjects: [{
            type: String,
            required: true,
    }],
})

userSchema.statics.findAndValidate = async function(username, password) {
    try{

        const currentUser = await this.findOne({ username });
        if(!currentUser) return false;
        const isValid = await bcrypt.compare(password, currentUser.password);
        return isValid ? currentUser : false;
    }catch(err){
        return false;
    }
}

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})


const User = mongoose.model('User', userSchema);
module.exports = User;