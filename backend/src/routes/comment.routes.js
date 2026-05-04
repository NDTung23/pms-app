const express = require('express')
const router  = express.Router()
const { getComments, createComment, deleteComment } = require('../controllers/comment.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/:cardId',    getComments)
router.post('/:cardId',   createComment)
router.delete('/:id',     deleteComment)

module.exports = router
