var express = require('express');
const User = require('../src/Schemas/user.Schema');
const passport = require('passport');
var router = express.Router();
const crypto = require('crypto');

router.post('/login', (req,res, next) => {
  passport.authenticate('local', (one,user, message) => {
    console.log("cbbb: ", one, user, message);
    if(user){
      console.log(req.user);
      return req.login(user, (err) => {
        if(err){
          return res.status(500).send(err);
        }
        console.log("user now: ", req.user);
        return res.status(200).send({user: req.user});
      });
      
    }
    return res.status(401).send(message);
  })(req,res,next);
});

router.post('/signup', function(req, res, next) {
  try {
    var salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
      const userId = (await User.find({})).length + 1;
      try {
        const create = await User.create({
          userName: req.body.username,
          password: hashedPassword.toString('hex'),
          salt: salt,
          displayName: req.body.name,
          userId,
        });
        console.log("create: ", create);
        req.login(create, function(err) {
          if (err) { 
            throw Error(err);
           }
          return res.redirect('/');
        });
      } catch (error) {
        console.log("error: ", error);
        return res.status(500).send(error);
      }
    });
  } catch (error) {
    console.log("error: ". error);
    
  }

});

router.get('/logout', async function(req, res, next) {
  try {
    return req.logout(function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  } catch (error) {
    return res.status(500).send(error);
  }

  return res.send('respond with a resource');
});

module.exports = router;
