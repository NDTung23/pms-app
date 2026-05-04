const express = require('express')
const router  = express.Router()
const { getLists, createList, updateList, deleteList } = require('../controllers/list.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/',       getLists)
router.post('/',      createList)
router.put('/:id',    updateList)
router.delete('/:id', deleteList)

module.exports = router
