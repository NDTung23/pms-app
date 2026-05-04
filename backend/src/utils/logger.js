const { NODE_ENV } = require('../config/env')

const logger = {
  info:  (...args) => console.log('[INFO]',  ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn:  (...args) => console.warn('[WARN]',  ...args),
  debug: (...args) => { if (NODE_ENV === 'development') console.log('[DEBUG]', ...args) },
}

module.exports = logger
