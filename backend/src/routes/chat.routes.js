const express = require('express')
const router  = express.Router()
const { getChannels, createChannel, deleteChannel, getMessages, sendMessage, deleteMessage } = require('../controllers/chat.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/channels',                        getChannels)
router.post('/channels',                       createChannel)
router.delete('/channels/:id',                 deleteChannel)
router.get('/channels/:channelId/messages',    getMessages)
router.post('/channels/:channelId/messages',   sendMessage)
router.delete('/messages/:id',                 deleteMessage)

module.exports = router
