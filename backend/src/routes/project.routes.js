const express = require('express')
const router  = express.Router()
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, addMember, removeMember, getProjectProgress
} = require('../controllers/project.controller')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')
const { auditLog }  = require('../middlewares/audit.middleware')

router.use(protect)
router.get('/',                       getProjects)
router.post('/',                      authorize('admin','pm'), auditLog('create','project'), createProject)
router.get('/:id',                    getProject)
router.put('/:id',                    auditLog('update','project'), updateProject)
router.delete('/:id',                 authorize('admin'), auditLog('delete','project'), deleteProject)
router.get('/:id/progress',           getProjectProgress)
router.post('/:id/members',           auditLog('add_member','project'), addMember)
router.delete('/:id/members/:userId', auditLog('remove_member','project'), removeMember)

module.exports = router
