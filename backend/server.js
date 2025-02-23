require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
const mongoose = require('mongoose')

//Import routes
const userRoute = require('./routes/userRoute')
const certificateRoute = require('./routes/certificateRoute')
const projectRoute = require('./routes/projectRoute')
const messageRoute = require('./routes/messageRoute')
const postRoute = require('./routes/postRoute')

// Use cookie-parser middleware
app.use(cookieParser())

//router
app.use('/api/users', userRoute)
app.use('/api/certificates', certificateRoute)
app.use('/api/projects', projectRoute)
app.use('/api/messages', messageRoute)
app.use('/api/posts', postRoute)

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
