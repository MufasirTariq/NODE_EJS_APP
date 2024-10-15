const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const router = require("./routes/routes")



const app = express();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/NodeEjsApp")
.then(() => {
    console.log('Database Connected');
}).catch((error) => console.log(error))

//middlewares
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret:'TheWeekndXO',
        saveUninitialized: true,
        resave: false,
    }));
    app.use((req, res, next) => {
        res.locals.message = req.session.message;
        delete req.session.message;
        next(); 
    });

    app.use(express.static('uploads'));
// set templates
    app.set('view engine', 'ejs');

// routes    
    app.use('', router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})