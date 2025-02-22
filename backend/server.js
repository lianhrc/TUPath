require('dotenv').config()
const express = require('express')

const app = express()
const mongoose = require('mongoose')

//Import routes
const userRoute = require('./routes/userRoute')

//router
app.use('/api/users', userRoute)

//connect to mnogoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to db and listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
    