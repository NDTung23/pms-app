const express = require('express')
const router  = express.Router()
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notification.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/',                 getNotifications)
router.patch('/read-all',       markAllRead)
router.patch('/:id/read',       markRead)
router.delete('/:id',           deleteNotification)

module.exports = router
