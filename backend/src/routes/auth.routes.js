const express = require('express')
const router  = express.Router()
const { register, login, logout, getMe, forgotPassword, resetPassword, changePassword, updateProfile } = require('../controllers/auth.controller')
const { protect } = require('../middlewares/auth.middleware')

router.post('/register',         register)
router.post('/login',            login)
router.post('/logout',           protect, logout)
router.get('/me',                protect, getMe)
router.post('/forgot-password',  forgotPassword)
router.post('/reset-password',   resetPassword)
router.put('/change-password',   protect, changePassword)
router.put('/profile',           protect, updateProfile)

module.exports = router
