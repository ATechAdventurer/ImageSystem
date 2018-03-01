let Config = {};

Config.ListenPort = 8080;
Config.DBType = "mongodb";
Config.MongoDB_URL = process.env.MongoDB_URL || "";

module.exports = Config;