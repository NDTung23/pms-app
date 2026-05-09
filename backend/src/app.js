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

app.use('/api/auth',          require('./routes/auth.routes'))
app.use('/api/users',         require('./routes/user.routes'))
app.use('/api/projects',      require('./routes/project.routes'))
app.use('/api/boards',        require('./routes/board.routes'))
app.use('/api/lists',         require('./routes/list.routes'))
app.use('/api/cards',         require('./routes/card.routes'))
app.use('/api/comments',      require('./routes/comment.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/reports',       require('./routes/report.routes'))
app.use('/api/sprints',       require('./routes/sprint.routes'))
app.use('/api/finance',       require('./routes/finance.routes'))
app.use('/api/chat',          require('./routes/chat.routes'))
app.use('/api/audit-logs',    require('./routes/auditlog.routes'))
app.use('/api/workspace',     require('./routes/workspace.routes'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PMS API dang chay', timestamp: new Date() })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint khong ton tai' })
})

app.use(errorHandler)

module.exports = app
