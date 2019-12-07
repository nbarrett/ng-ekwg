const crew = require("serenity-js/lib/stage_crew");

exports.config = {

  directConnect: true,
  baseUrl: "https://ekwg-dev.herokuapp.com",
  chromeDriver: require('chromedriver/lib/chromedriver').path,
  allScriptsTimeout: 30000,
  getPageTimeout: 30000,

  framework: "custom",
  frameworkPath: require.resolve("serenity-js"),
  serenity: {
    stageCueTimeout: 60 * 1000,
    dialect: "mocha",
    crew: [
      crew.serenityBDDReporter(),
      crew.consoleReporter(),
      crew.Photographer.who(_ => _
        .takesPhotosOf(_.Failures)
        .takesPhotosWhen(_.Activity_Finishes)),
    ],
  },

  specs: [
    "serenity-js/features/**/" + process.env["RAMBLERS_FEATURE"] || "*.ts",
  ],

  mochaOpts: {
    ui: "bdd",
    compiler: "ts:ts-node/register",
  },

  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      binary: process.env["GOOGLE_CHROME_BIN"],
      args: [
        "--no-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--log-level=3",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--headless",
      ],
    },

    shardTestFiles: false,
    maxInstances: 1,
  },

  disableChecks: true,
  ignoreUncaughtExceptions: true,
  debug: true,
  restartBrowserBetweenTests: false,

  onPrepare: function () {
    browser.ignoreSynchronization = true;
  },
};
