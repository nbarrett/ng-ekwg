const _ = require("lodash")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const passport = require("passport");
const config = require("../../config/config");
const debug = require("debug")(config.logNamespace("database:auth"));
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const tokenExpiry = {auth: 10, refresh: 5};
const SECRET = process.env.JWT_SECRET;
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
};

passport.use(new JwtStrategy(passportOpts, function (jwtPayload, done) {
  const expirationDate = new Date(jwtPayload.exp * 1000);
  if (expirationDate < new Date()) {
    return done(null, false);
  }
  done(null, jwtPayload);
}));

passport.serializeUser(function (user, done) {
  debug("serializeUser called with user:", user);
  done(null, user.userName)
});

// not used for some reason
passport.deserializeUser(function (id, done) {
  debug("serializeUser called with user id:", id);
  done(err, id);
});

exports.tokenExpiry = tokenExpiry

exports.hashValue = (value) => {
  return bcrypt.hash(value, 10);
}

exports.randomToken = (value) => {
  return randtoken.uid(256);
}

exports.signValue = (value, expiry) => {
  return jwt.sign(value, SECRET, {expiresIn: expiry});
}

exports.compareValue = (inputValue, storedValue) => {
  return bcrypt.compare(inputValue, storedValue)
}

exports.authenticate = () => {
  return passport.authenticate("jwt")
}
