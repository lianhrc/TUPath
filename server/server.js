require('dotenv').config()
const express = require('express')

//express app
const app = express()
const mongoose = require('mongoose')

// Middleware to parse JSON bodies
app.use(express.json())

// Import Router
const userRouter = require('./routes/userRoute')
const postRouter = require('./routes/postRoute')
const messageRouter = require('./routes/messageRoute')

//router
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/messages', messageRouter)

//connect to mongodb
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