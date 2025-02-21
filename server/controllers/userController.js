const bcrypt = require('bcrypt')
const User = require('../models/userModel')

// Create user
const createUser = (async (req, res) => {
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
        res.status(500).json({ error: error.message })
    }
})

// Read all users
const readAllUsers = (async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Read user by ID
const readUserById = (async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update user
const updateUser = (async (req, res) => {
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
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete user
const deleteUser = (async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Export the functions properly for CommonJS
module.exports = {
    createUser,
    readAllUsers,
    readUserById,
    updateUser,
    deleteUser
}
