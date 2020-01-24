const config = require("../../config/config");
const authConfig = require("../../auth/auth-config");
const debug = require("debug")(config.logNamespace("database:auth"));
const auth = require("../models/auth");
const refreshToken = require("../models/refresh-token");
const common = require("./auth-common");

exports.logMember = (req, res) => {
  authConfig.hashValue(req.body.password).then(hash => {
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

exports.auditMemberLogin = (req, res) => {
  common.auditMemberLogin(req.body.userName, req.body.loginResponse, req.body.member)
  res.status(201)
    .catch(error => {
      res.status(500).json({
        message: "failed to audit",
        error: error
      });
    });
}

exports.createMember = (req, res, next) => {
  authConfig.hashValue(req.body.password).then(hash => {
    new auth({
      userName: req.body.userName,
      password: hash
    }).save()
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

exports.logout = (req, res) => {
  const existingRefreshToken = req.body.refreshToken;
  const member = req.body.member;
  debug("logout:called with refreshToken:", existingRefreshToken);
  refreshToken.deleteOne({refreshToken: existingRefreshToken})
    .then(result => {
      if (result.n > 0) {
        const loginResponse = {alertMessage: `The member ${member.userName} logged out successfully`};
        common.auditMemberLogin(member.userName, loginResponse, member);
        res.status(200).json({loginResponse: loginResponse});
      } else {
        const loginResponse = {alertMessage: `The member ${member.userName} logged out but access token was not found`};
        common.auditMemberLogin(member.userName, loginResponse, member);
        res.status(200).json({loginResponse: loginResponse});
      }
    })
    .catch(error => {
      const loginResponse = {
        alertMessage: `The member ${member.userName} logged out with unexpected error`,
        error: error
      };
      common.auditMemberLogin(member.userName, loginResponse, member);
      res.status(200).json({loginResponse: loginResponse});
    });
}

exports.refresh = (req, res) => {
  const existingRefreshToken = req.body.refreshToken;
  debug("refresh:refreshToken:", existingRefreshToken);
  refreshToken.findOne({refreshToken: existingRefreshToken})
    .then(existingToken => {
      debug("refresh:refreshToken is in refreshToken");
      let memberPayload = existingToken.memberPayload;
      const token = authConfig.signValue(memberPayload, authConfig.tokenExpiry.refresh);
      res.json({auth: token})
    })
    .catch(err => {
      debug("refresh returning 401: refreshToken, not found");
      res.sendStatus(401);
    });
}
