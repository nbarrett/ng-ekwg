const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const passport = require("passport");
const {envConfig} = require("../env-config/env-config");
const debug = require("debug")(envConfig.logNamespace("auth-config"));
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const tokenExpiry = {auth: 60 * 60 * 12, refresh: 60 * 60};
const SECRET = envConfig.auth.secret;
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
};

passport.use(new JwtStrategy(passportOpts, (jwtPayload, done) => {
  const expirationDate = new Date(jwtPayload.exp * 1000);
  if (expirationDate < new Date()) {
    return done(null, false);
  }
  done(null, jwtPayload);
}));

passport.serializeUser((user, done) => {
  done(null, user.userName)
});

// not used for some reason
passport.deserializeUser((id, done) => {
  done(err, id);
});

exports.tokenExpiry = tokenExpiry

exports.hashValue = (value) => {
  return bcrypt.hash(value, 10);
}

exports.randomToken = () => {
  return randtoken.uid(256);
}

exports.signValue = (value, expiry) => {
  return jwt.sign(value, SECRET, {expiresIn: expiry});
}

exports.compareValue = (inputValue, storedValue) => {
  return bcrypt.compare(inputValue, storedValue)
}

exports.authenticate = () => {
  return passport.authenticate("jwt");
}
