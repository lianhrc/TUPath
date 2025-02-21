const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/userModels')
const router = express.Router()

//create user
router.post('/', async (req, res) => {
    const { email, password, isNewUser, googleSignup, role, profileDetails } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ 
            email, 
            password: hashedPassword,
            isNewUser,
            googleSignup,
            role,
            profileDetails
        })
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//read all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//read user by id
router.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//update user
router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { email, password, isNewUser, googleSignup, role, profileDetails } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.findByIdAndUpdate(id, { 
            email, 
            password: hashedPassword,
            isNewUser,
            googleSignup,
            role,
            profileDetails
        }, { new: true })
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//delete user
router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json({message: 'User deleted successfully'})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = router