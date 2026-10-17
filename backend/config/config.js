require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dealconnect",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    pool: {
      max: 25,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  },

  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: (process.env.DB_NAME || "dealconnect") + "_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false
  },

  production: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dealconnect",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    pool: {
      max: 30,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};