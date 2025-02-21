const express = require('express')

const { createUser, readAllUsers, readUserById, updateUser, deleteUser } = require('../controllers/userController')

const router = express.Router()

router.post('/', createUser)        //create user
router.get('/', readAllUsers)       //read all users
router.get('/:id', readUserById)      //read user by id  
router.put('/:id', updateUser)      //update user
router.delete('/:id', deleteUser)   //delete user

module.exports = router