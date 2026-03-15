// ─────────────────────────────────────────────────────────────────
// Week 3 Task 2: Winston Logger
// Logs everything to BOTH console AND security.log file
// ─────────────────────────────────────────────────────────────────
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',

  // Log format: timestamp + level + message
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),

  transports: [
    // 1) Print to terminal
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => `${level}: ${message}`)
      ),
    }),

    // 2) Save ALL logs to security.log file
    new winston.transports.File({ filename: 'security.log' }),

    // 3) Save only errors to error.log file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

module.exports = logger;