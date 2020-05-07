const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Skout = require('./skout')

const userSchema = new mongoose.Schema({ 
name: {
    type: String,
    required: true,
    trim: true
},
email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
        if(!validator.isEmail(value)) {
            throw new Error('Email is invalid')
        }
    }
},
password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate(value) {
        if(value.toLowerCase().includes('password')) {
            throw new Error('Come on now. You can do better than that.')
        }
    }
},
tokens: [{
    token: {
        type: String,
        required: true
    }
}],
avatar: {
    type: Buffer
}
}, {
    timestamps: true
})

userSchema.virtual('skouts', {
    ref: 'Skout',
    localField: '_id', // define the relationship
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() { // applies to all invocations of user
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this // reg func and this since middleware 
    const token = jwt.sign({ _id: user._id.toString() }, 'welovefreund')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => { 
    const user = await User.findOne({ email })
    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plaintext passwords before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user skouts when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Skout.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User