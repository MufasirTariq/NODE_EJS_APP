const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { error } = require('console');

// Image Upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname); 
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// get all users on home page
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec(); 
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// render to add user page
    router.get('/add', (req, res) => {
        res.render('addUsers', { title: "Add Users" });
    });

// Insert User
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save(); 
        req.session.message = {
            type: "success",
            message: "User Added Successfully",
        };

        res.redirect('/'); 
        
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

// Render user update page
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).exec(); 
        if (!user) {
            res.redirect('/');
        } else {
            res.render("editUser", {
                title: "Update User",
                user: user,
            });
        }
    } catch (err) {
        res.redirect('/');
    }
});

// Update user
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    
    let new_img = '';
    if (req.file) {
        new_img = req.file.filename;
        try {
            fs.unlinkSync(path.join(__dirname, '../uploads', req.body.old_image));
        } catch (err) {
            console.error('Error deleting old image:', err);
        }
    } else {
        new_img = req.body.old_image;
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_img,
        }, { new: true });

        if (!result) {
            req.session.message = {
                type: 'danger',
                message: 'User not found',
            };
            return res.redirect('/');
        }

        req.session.message = {
            type: 'success',
            message: 'User Updated Successfully',
        };
        res.redirect('/');
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message,
        };
        res.redirect('/');
    }
});

// Delete User
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const result = await User.findByIdAndDelete(id).exec();

        if (result && result.image) {
            try {
                fs.unlinkSync(path.join(__dirname, '../uploads', result.image));
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }

        req.session.message = {
            type: "success",
            message: "User Deleted Successfully"
        };

        res.redirect('/');  // Redirect to home or wherever you want
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message
        };
        res.redirect('/');  // Redirect to home or error page
    }
});

module.exports = router;
