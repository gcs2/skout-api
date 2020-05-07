const mongoose = require('mongoose')

const instructionSchema = mongoose.Schema({
    instruction: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {
    timestamps: true
})

const Instruction = mongoose.model('Instruction', instructionSchema)

module.exports = Instruction