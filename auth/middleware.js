function authenticationMiddleware(){
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.status(401).send({message: "Unauthorized"});
  }
}

module.exports = {authenticationMiddleware};