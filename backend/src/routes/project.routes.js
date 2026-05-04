const express  = require('express')
const router   = express.Router()
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/project.controller')
const { protect }      = require('../middlewares/auth.middleware')
const { authorize }    = require('../middlewares/role.middleware')

router.use(protect)

router.get('/',                       getProjects)
router.post('/',                      createProject)           // Mọi user đều tạo được
router.get('/:id',                    getProject)
router.put('/:id',                    updateProject)           // PM/owner tự kiểm tra trong controller
router.delete('/:id',                 authorize('admin'), deleteProject) // Chỉ admin
router.post('/:id/members',           addMember)
router.delete('/:id/members/:userId', removeMember)

module.exports = router
