require('dotenv').config()
const app       = require('./src/app')
const connectDB = require('./src/config/db')
const { PORT }  = require('./src/config/env')

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api/health`)
  })
}

start()
