const express = require('express')
const User = require('../models/user')
const Instruction = require('../models/instruction')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create a instruction to the database
router.post('/instructions', auth, async (req, res) => { 
    const instruction = new Instruction({
        ...req.body,
        owner: req.user._id
    })
    try {
        await instruction.save()
        res.status(201).send(instruction)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Read all instructions from the database
router.get('/instructions', async (req, res) => { 
    const instructions = await Instruction.find({})
    try {
        res.send(instructions)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Read an instruction with the given id
router.get('/instructions/:id', auth, async (req, res) => { 
    const _id = req.params.id

    try {
        const instruction = await Instruction.findOne({ _id, owner: req.user._id })

        if (!instruction) {
            return res.status(404).send()
        }
        res.send(instruction)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/instructions/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const instruction = await Instruction.findOne({ _id: req.params.id, owner: req.user._id })

        if(!instruction) {
            return res.status(404).send()
        }

        updates.forEach((update) => instruction[update] = req.body[update])
        await instruction.save()

        res.send(instruction)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Delete an instruction
router.delete('/instructions/:id', auth, async (req, res) => { 
    try {
        const instruction = await Instruction.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if(!instruction) {
            return res.status(404).send()
        }

        res.send(instruction)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router