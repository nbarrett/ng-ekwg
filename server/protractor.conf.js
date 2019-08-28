const crew = require("serenity-js/lib/stage_crew");

exports.config = {

  directConnect: true,
  baseUrl: "https://ekwg-dev.herokuapp.com",
  chromeDriver: process.env["CHROMEDRIVER_PATH"],
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
        "--disable-infobars",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=800,1600",
        "--disable-extensions",
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
