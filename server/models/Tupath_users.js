const mongoose = require('mongoose')

const Tupath_usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})


const Tupath_usersModel = mongoose.model("tupath_user", Tupath_usersSchema)
module.exports = Tupath_usersModel