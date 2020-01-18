const _ = require("lodash")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const passport = require("passport");
const moment = require("moment-timezone");
const config = require("../../config/config");
const debug = require("debug")(config.logNamespace("database:auth"));
const auth = require("../models/auth");
const memberAudit = require("../models/member-audit");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const authTokenExpiry = 10;
const refreshTokenExpiry = 5;
const refreshTokens = {};
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

const determineLoginSuccessAndAudit = (memberPayload, memberFlags) => {
  const userName = memberPayload.userName;
  const loginResponse = {userName};
  debug("determineLoginSuccessAndAudit:member", memberPayload);
  if (!memberFlags.groupMember) {
    loginResponse.alertMessage = `Logins for member ${userName} have been disabled. Please`;
  } else if (memberFlags.expiredPassword) {
    loginResponse.showResetPassword = true;
    loginResponse.alertMessage = `The password for ${userName} has expired. You must enter a new password before continuing. Alternatively`;
  } else {
    loginResponse.memberLoggedIn = true;
    loginResponse.alertMessage = `The member ${userName} logged in successfully`;
  }
  auditMemberLogin(userName, loginResponse, memberPayload);
  return loginResponse;
}

const auditMemberLogin = (userName, loginResponse, member) => {
  debug("auditMemberLogin:userName", userName);
  const audit = new memberAudit({
    userName,
    loginTime: moment().tz("Europe/London").valueOf(),
    loginResponse,
    member: member
  });
  audit.save()
    .then(result => {
      debug("audited");
    })
    .catch(err => {
      debug("failed to audit", audit, "due to", err);
    });
}

const returnAuthFailure = (options) => {
  const loginResponse = {
    alertMessage: `Authentication failed due to ${options.message}. Please try again or`,
    userName: options.userName
  };
  auditMemberLogin(options.userName, loginResponse, options.member)
  return options.res.status(401).json({
    loginResponse: loginResponse
  });
};

exports.auditMemberLogin = (req, res) => {
  auditMemberLogin(req.body.userName, req.body.loginResponse, req.body.member)
  res.status(201)
    .catch(error => {
      res.status(500).json({
        message: "failed to audit",
        error: error
      });
    });
}

exports.logMember = (req, res) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    res.status(201).json({
      userName: req.body.userName,
      password: req.body.password,
      passwordHash: hash,
      message: "password hashed successfully"
    })
      .catch(err => {
        res.status(500).json({
          message: "Invalid authentication credentials"
        });
      });
  });
}

exports.createMember = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const auth = new auth({
      userName: req.body.userName,
      password: hash
    });
    auth
      .save()
      .then(result => {
        res.status(201).json({
          userName: req.body.userName,
          message: "auth created!"
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Invalid authentication credentials"
        });
      });
  });
}

const toMemberPayload = (member) => {
  const memberPayload = {
    memberId: member._id,
    walkAdmin: member.walkAdmin,
    socialAdmin: member.socialAdmin,
    socialMember: member.socialMember,
    contentAdmin: member.contentAdmin,
    memberAdmin: member.memberAdmin,
    financeAdmin: member.financeAdmin,
    committee: member.committee,
    treasuryAdmin: member.treasuryAdmin,
    fileAdmin: member.fileAdmin,
    firstName: member.firstName,
    lastName: member.lastName,
    postcode: member.postcode,
    userName: member.userName,
    profileSettingsConfirmed: member.profileSettingsConfirmed
  };
  debug("memberPayload:", memberPayload);
  return memberPayload;
}

const returnResponse = function (options) {
  const response = {
    loginResponse: determineLoginSuccessAndAudit(options.memberPayload, {
      groupMember: options.member.groupMember,
      expiredPassword: options.member.expiredPassword
    })
  };
  if (response.loginResponse.memberLoggedIn) {
    const refreshToken = randtoken.uid(256);
    response.tokens = {
      auth:
        jwt.sign(options.memberPayload, SECRET, {expiresIn: authTokenExpiry}),
      refresh: refreshToken
    }
    debug("adding:refreshToken", refreshToken);
    refreshTokens[refreshToken] = options.member.userName;
  }
  debug("returning:response", response);
  options.res.status(response.loginResponse.memberLoggedIn || response.loginResponse.showResetPassword ? 200 : 401).json(response);
};

exports.login = (req, res) => {
  const userName = req.body.userName;
  debug("attempting to login ", userName);
  auth.findOne({userName: userName})
    .then(member => {
      debug("findOne - member:", member);
      debug("findOne - member:password", member.password, "member.groupMember:", member.groupMember, "member.expiredPassword:", member.expiredPassword);
      if (member) {
        const memberPayload = toMemberPayload(member);
        const clearTextPasswordMatches = req.body.password === member.password;
        if (clearTextPasswordMatches) {
          debug("findOne - clearTextPasswordMatches:", clearTextPasswordMatches);
          returnResponse({res: res, memberPayload: memberPayload, member: member});
        } else {
          bcrypt.compare(req.body.password, member.password).then((success) => {
            debug("bcryptComparisonSuccess:", success);
            if (success) {
              returnResponse({res: res, memberPayload: memberPayload, member: member});
            } else {
              returnAuthFailure({res: res, message: "incorrect password supplied", userName});
            }
          });
        }
      } else {
        returnAuthFailure({res: res, message: "incorrect user name or password supplied", userName, member: member});
      }
    })
    .catch(err => {
      if (err) {
        returnAuthFailure({res: res, message: "an unexpected error - " + err});
      } else {
        returnAuthFailure({res: res, message: "Your member credentials were not entered correctly"});
      }
    });
}

exports.logout = (req, res) => {
  const refreshToken = req.body.refreshToken;
  const member = req.body.member;
  debug("logout:called with refreshToken:", refreshToken);
  if (refreshToken in refreshTokens) {
    debug("deleting:refreshToken", refreshToken);
    delete refreshTokens[refreshToken];
  }

  const loginResponse = {alertMessage: `The member ${member.userName} logged out successfully`};
  auditMemberLogin(member.userName, loginResponse, member);
  res.status(200).json({loginResponse: loginResponse});
}

exports.refresh = (req, res) => {
  const refreshToken = req.body.refreshToken;
  debug("refresh:called with refreshToken:", refreshToken);

  if (refreshToken in refreshTokens) {
    debug("refresh:refreshToken is in refreshTokens");
    let userName = refreshTokens[refreshToken];
    const user = toMemberPayload(userName);
    const token = jwt.sign(user, SECRET, {expiresIn: refreshTokenExpiry});
    res.json({auth: token})
  } else {
    debug("refresh returning 401: refreshToken, is NOT in refreshTokens");
    res.sendStatus(401);
  }
}

exports.example = (req, res) => {
  res.json({value: Math.floor(Math.random() * 100)});
}
