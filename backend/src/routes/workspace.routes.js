const express = require('express')
const router  = express.Router()
const { getWorkspace, updateWorkspace, updatePasswordPolicy, updateFeatures } = require('../controllers/workspace.controller')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(protect)
router.get('/',                authorize('admin', 'pm'), getWorkspace)
router.put('/',                authorize('admin'), updateWorkspace)
router.put('/password-policy', authorize('admin'), updatePasswordPolicy)
router.put('/features',        authorize('admin'), updateFeatures)

module.exports = router
