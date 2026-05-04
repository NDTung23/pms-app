const express = require('express')
const router  = express.Router()
const { getCards, createCard, updateCard, deleteCard, moveCard, assignMember, removeMember } = require('../controllers/card.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/',                         getCards)
router.post('/',                        createCard)
router.put('/:id',                      updateCard)
router.delete('/:id',                   deleteCard)
router.patch('/:id/move',               moveCard)
router.post('/:id/members',             assignMember)
router.delete('/:id/members/:userId',   removeMember)

module.exports = router
