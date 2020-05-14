const mongoose = require('mongoose')

const skoutSchema = mongoose.Schema({
    evaluation: {
        type: String,
        trim: true,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        validate(value) {
            if (value > 5 || value < 0) {
                throw new Error('Rating must be from 1-5')
            }
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {
    timestamps: true
})

const Skout = mongoose.model('Skout', skoutSchema)

module.exports = Skout