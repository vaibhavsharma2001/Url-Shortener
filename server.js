const express = require('express')
const mongoose = require('mongoose')
const passport=require('passport')
const session = require('express-session');  //?retryWrites=true&w=majority const passport=require('passport')
const passportjs=require('./config/passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const app=express()
const User=require('./models/user')
const ShortUrl=require('./models/shortUrl')
//mongodb+srv://Vaibhav11:0987654321@cluster0.7ggft8m.mongodb.net
const db=mongoose.connect('mongodb+srv://vaibhav1234:poiuytrewq@newcluster.dvgt1up.mongodb.net/urldata', {
   useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>{
  console.log("connected")
}).catch((err) => console.error('Error connecting to MongoDB', err));

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(
  session({
    secret: 'wq@1wq12', // Change this to a random string
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session())


function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/register'); // Redirect to register if not authenticated
}

app.get('/', isAuthenticated, async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls, user: req.user });
});

// Function to check authentication

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;


  // Validation goes here...

  
  
    // Validation passed
    const newUser = new User({
      name,
      email,
      password
    });

    // Hash password
    bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;

        newUser.password = hash;

        // Save user
        newUser
          .save()
          .then(user => {
            res.redirect('/login');
          })
          .catch(err => console.log(err));
      })
    );
  }
);

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
 
  })
);



app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl })

  res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
})


app.listen(process.env.PORT || 5000,()=>{
  console.log("im running")
});
