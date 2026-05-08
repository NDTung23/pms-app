const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const { CLIENT_URL } = require('./config/env')
const { errorHandler } = require('./middlewares/error.middleware')

const app = express()

app.use(helmet())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

// ── Routes ──
app.use('/api/auth',          require('./routes/auth.routes'))
app.use('/api/users',         require('./routes/user.routes'))
app.use('/api/projects',      require('./routes/project.routes'))
app.use('/api/boards',        require('./routes/board.routes'))
app.use('/api/lists',         require('./routes/list.routes'))
app.use('/api/cards',         require('./routes/card.routes'))
app.use('/api/comments',      require('./routes/comment.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/reports',       require('./routes/report.routes'))
app.use('/api/sprints',       require('./routes/sprint.routes'))    // UC15, UC16
app.use('/api/finance',       require('./routes/finance.routes'))   // UC26-30
app.use('/api/chat',          require('./routes/chat.routes'))      // UC25
app.use('/api/audit-logs',    require('./routes/auditlog.routes'))  // UC37

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PMS API đang chạy 🚀' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' })
})

app.use(errorHandler)

module.exports = app
