const express = require('express')
const User = require('../models/user')
const Skout = require('../models/skout')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create a skout
router.post('/skouts', auth, async (req, res) => { 
    const skout = new Skout({
        ...req.body,
        owner: req.user._id
    })
    try {
        await skout.save()
        res.status(201).send(skout)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Read all skouts from the database
router.get('/skouts', async (req, res) => { 
    const skouts = await Skout.find({})
    try {
        res.send(skouts)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Read a skout with the given id
router.get('/skouts/:id', auth, async (req, res) => { 
    const _id = req.params.id

    try {
        const skout = await Skout.findOne({ _id, owner: req.user._id })

        if (!skout) {
            return res.status(404).send()
        }
        res.send(skout)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Update a skout
router.patch('/skouts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['evaluation', 'rating']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const skout = await Skout.findOne({ _id: req.params.id, owner: req.user._id })

        if(!skout) {
            return res.status(404).send()
        }

        updates.forEach((update) => skout[update] = req.body[update])
        await skout.save()

        res.send(skout)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Delete a skout
router.delete('/skouts/:id', auth, async (req, res) => { 
    try {
        const skout = await Skout.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if(!skout) {
            return res.status(404).send()
        }

        res.send(skout)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router