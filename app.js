const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//-------------------------------------Connect to Database
mongoose.connect('mongodb://localhost:27017/db', { useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log(`Database has been connected successfully`);
});
//-------------------------------------Schema
autoIncrement.initialize(db);

Schema = mongoose.Schema;

userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    email: String
});

mongoose.model('User', userSchema);

userSchema.plugin(autoIncrement.plugin, {
    model: 'User', field: '_id',
    startAt: 0,
    incrementBy: 1
})
//-------------------------------------CRUD
let User = mongoose.model('user', userSchema);

app.get('/find', (req, res) => {
    User.find()
        .then(users => {
            res.status(200).json(users);
        }).catch(err => {
            res.status(500).json({ message: err.message || "Some error occurred while retrieving users." });
        });
});

app.get('/find/:userId', (req, res) => {
    User.findById(req.params.userId)
        .then(users => {
            res.status(200).json(users);
        }).catch(err => {
            res.status(500).json({ message: err.message || "Some error occurred while retrieving users." });
        });
});

app.post('/create', (req, res) => {
    User.nextCount((err, count) => {
        let user = new User({ name: req.body.name, email: req.body.email });
        user.save()
            .then(data => {
                res.status(201).json(data);
            }).catch(err => {
                res.status(500).json({ message: err.message || "Some error occurred while creating the User." });
            });
    });
});

app.put('/update/:userId', (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "User content can not be empty" });
    }
    User.findByIdAndUpdate(req.params.userId, req.body)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found with id " + req.params.userId });
            }
            res.status(200).json({ message: "User updated successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ message: "User not found with id " + req.params.userId });
            }
            return res.status(500).json({ message: "Error updating user with id " + req.params.userId + err });
        });
});


app.delete('/delete/:userId', (req, res) => {
    User.findByIdAndRemove(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found with id " + req.params.userId });
            }
            res.status(200).json({ message: "User deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).json({ message: "User not found with id " + req.params.userId });
            }
            return res.status(500).json({ message: "Could not delete user with id " + req.params.userId });
        });
});
//-------------------------------------
app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
});
