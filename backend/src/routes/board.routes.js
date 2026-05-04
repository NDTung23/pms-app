const express = require('express')
const router  = express.Router()
const { getBoards, createBoard, deleteBoard } = require('../controllers/board.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/',       getBoards)
router.post('/',      createBoard)
router.delete('/:id', deleteBoard)

module.exports = router
