var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
const crypto = require('crypto');


var app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');
const User = require('./src/Schemas/user.Schema');
const res = require('express/lib/response');
const { authenticationMiddleware } = require('./auth/middleware');
const url = "mongodb+srv://amartyamishra8:RTOhaxa1s15Z9kxF@cluster0.gx8xyae.mongodb.net/?retryWrites=true&w=majority";
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoDBStore({ uri: url, collection: "sessions" })
}));
app.use(passport.authenticate('session'));
mongoose.connect(url).then((res) =>{
  console.log("connected");
}).catch(err => {
  console.log(err);
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', authenticationMiddleware(), postsRouter);

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  try {
    const user = await User.findOne({userName: username});
    if(!user) throw new Error('Incorrect username or password.');
    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      const passwordAsBuffer = Buffer.from(user.password, 'hex');
      const utf8buff = Buffer.from(hashedPassword, 'utf-8');
      if (!crypto.timingSafeEqual(passwordAsBuffer, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, user);
    });
  } catch (error) {
    console.log("error: ", error);
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
}));

passport.serializeUser(function(user, cb) {
  console.log("serialize: ", user);
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.userName, userId: user.userId });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
