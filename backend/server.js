require('dotenv').config()
const express = require('express')

const app = express()
const mongoose = require('mongoose')

//Import routes
const userRoute = require('./routes/userRoute')
const certificateRoute = require('./routes/certificateRoute')
const projectRoute = require('./routes/projectRoute')

//router
app.use('/api/users', userRoute)
app.use('/api/certificates', certificateRoute)
app.use('/api/projects', projectRoute)

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
    