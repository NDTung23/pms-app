const express = require('express')
const router  = express.Router()
const {
  getCards, createCard, updateCard, deleteCard,
  moveCard, assignMember, removeMember, updateChecklistItem
} = require('../controllers/card.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/',                         getCards)
router.post('/',                        createCard)
router.put('/:id',                      updateCard)
router.delete('/:id',                   deleteCard)
router.patch('/:id/move',               moveCard)          // UC19: ghi audit log khi kéo thả
router.post('/:id/members',             assignMember)
router.delete('/:id/members/:userId',   removeMember)
router.patch('/:id/checklist/:itemId',  updateChecklistItem)

module.exports = router
