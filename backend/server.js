require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

// Import routes
const userRoute = require('./routes/userRoute');
const certificateRoute = require('./routes/certificateRoute');
const projectRoute = require('./routes/projectRoute');
const messageRoute = require('./routes/messageRoute');
const postRoute = require('./routes/postRoute');

// Use cookie-parser middleware
app.use(cookieParser());
app.use(express.json());

// Router
app.use('/api/users', userRoute);
app.use('/api/certificates', certificateRoute);
app.use('/api/projects', projectRoute);
app.use('/api/messages', messageRoute);
app.use('/api/posts', postRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // Listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to db and listening on port', process.env.PORT);
        });
    })
    .catch((error) => {
        console.log(error);
    });
