const express = require('express')

const { createUser, readAllUsers, readUserById, updateUser, deleteUser } = require('../controllers/userController')

const router = express.Router()

router.post('/', createUser)       
router.get('/', readAllUsers)       
router.get('/:id', readUserById)    
router.put('/:id', updateUser)     
router.delete('/:id', deleteUser)  

module.exports = router