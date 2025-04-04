var path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "./.env") });

const args = process.argv.slice(2);
const modeArg = args.find((arg) => arg.startsWith("mode="));
const mode = modeArg ? modeArg.split("=")[1] : "development";

const envConfig = {
  production: {
    DB_HOST: process.env.PROD_DB_HOST,
    DB_USER: process.env.USER,
    DATABASE: process.env.DATABASE,
    PASSWORD: process.env.PASSWORD,
    DB_PORT: process.env.DB_PORT,
    DOMAIN: process.env.PROD_DOMAIN,
    NODEPORT: process.env.PROD_NODEPORT,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
  },
  development: {
    DB_HOST: process.env.SERVER_DEV_HOST,
    DB_USER: process.env.USER,
    DATABASE: process.env.DATABASE,
    PASSWORD: process.env.PASSWORD,
    DB_PORT: process.env.DB_PORT,
    DOMAIN: process.env.SERVER_DEV_DOMAIN,
    NODEPORT: process.env.SERVER_DEV_NODEPORT,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
  },
  development_local: {
    DB_HOST: process.env.LOCAL_DB_HOST,
    DB_USER: process.env.USER,
    DATABASE: process.env.DATABASE,
    PASSWORD: process.env.PASSWORD,
    DB_PORT: process.env.DB_PORT,
    DOMAIN: process.env.LOCAL_DOMAIN,
    NODEPORT: process.env.LOCAL_NODEPORT,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
  },
};

const config = envConfig[mode];

module.exports = config;
