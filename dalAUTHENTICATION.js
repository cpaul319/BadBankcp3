const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const url = 'mongodb://localhost:27017';
let db = null;

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    console.log("Connected successfully to db server");

    // Connect to myproject database
    db = client.db('myproject');
});

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_secret_key' // Replace with your secret key for JWT
};

// Initialize Passport
passport.use(new JwtStrategy(jwtOptions, function (jwt_payload, done) {
    // Check if the user exists in the database
    db.collection('users').findOne({ email: jwt_payload.email }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

const app = express();
app.use(express.json());
app.use(passport.initialize());

// Middleware to protect routes with authentication
const authenticateJWT = passport.authenticate('jwt', { session: false });

// create user account
function create(name, email, password) {
    return new Promise((resolve, reject) => {
        const collection = db.collection('users');
        const doc = { name, email, password, balance: 0 };
        collection.insertOne(doc, { w: 1 }, function (err, result) {
            err ? reject(err) : resolve(doc);
        });
    });
}

// find user account
function find(email) {
    return new Promise((resolve, reject) => {
        const customers = db
            .collection('users')
            .find({ email: email })
            .toArray(function (err, docs) {
                err ? reject(err) : resolve(docs);
            });
    });
}

// find user account
function findOne(email) {
    return new Promise((resolve, reject) => {
        const customers = db
            .collection('users')
            .findOne({ email: email })
            .then((doc) => resolve(doc))
            .catch((err) => reject(err));
    });
}

// update - deposit/withdraw amount (protected route)
function update(email, amount) {
    return new Promise((resolve, reject) => {
        const customers = db
            .collection('users')
            .findOneAndUpdate(
                { email: email },
                { $inc: { balance: amount } },
                { returnOriginal: false },
                function (err, documents) {
                    err ? reject(err) : resolve(documents);
                }
            );
    });
}

// all users (protected route)
function all() {
    return new Promise((resolve, reject) => {
        const customers = db
            .collection('users')
            .find({})
            .toArray(function (err, docs) {
                err ? reject(err) : resolve(docs);
            });
    });
}

// Routes
app.post('/login', function (req, res) {
    const { email, password } = req.body;
    // Validate user credentials (you can use bcrypt for password hashing and validation)
    // If valid, create a JWT token
    const token = jwt.sign({ email }, jwtOptions.secretOrKey);
    res.json({ token });
});

app.post('/create', function (req, res) {
    // Authenticate user before allowing account creation
    authenticateJWT(req, res, function () {
        const { name, email, password } = req.body;
        create(name, email, password)
            .then((user) => res.json(user))
            .catch((err) => res.status(500).json({ error: err.message }));
    });
});

app.get('/users', function (req, res) {
    // Authenticate user before allowing access to all users
    authenticateJWT(req, res, function () {
        all()
            .then((users) => res.json(users))
            .catch((err) => res.status(500).json({ error: err.message }));
    });
});

app.put('/update/:email', function (req, res) {
    // Authenticate user before allowing account update
    authenticateJWT(req, res, function () {
        const { email } = req.params;
        const { amount } = req.body;
        update(email, amount)
            .then((result) => res.json(result))
            .catch((err) => res.status(500).json({ error: err.message }));
    });
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
module.exports = {create, findOne, find, update, all};