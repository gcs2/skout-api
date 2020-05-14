// /Users/geoffreysalmon/mongodb/bin/mongod --dbpath=/Users/geoffreysalmon/mongodb-data

const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// Post a user to the database
router.post('/users', async (req, res) => { 
    console.log('In post users')
    console.log(req.body)
    const user = new User(req.body)
    try {
        await user.save() // await can only be used by async func
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})


// Login a user
router.post('/users/login', async (req, res) => { 
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

// Logout a user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Logout a user from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Read a user's profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Edit a user's profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body) // convert to array
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]) // bracket notation dynamically accesses a property)
        await req.user.save() // we don't use findByIdAndUpdate so that middleware can run

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        // sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router