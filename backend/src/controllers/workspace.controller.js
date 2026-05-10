const { success } = require('../utils/response')

let workspaceSettings = {
  name:     'PMS Workspace',
  logoUrl:  '',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  passwordPolicy: {
    minLength:        6,
    requireUppercase: false,
    requireNumber:    false,
    sessionTimeout:   480,
  },
  features: {
    chat:    true,
    finance: true,
    sprint:  true,
    report:  true,
  },
}

const getWorkspace = async (req, res, next) => {
  try { return success(res, workspaceSettings) }
  catch (err) { next(err) }
}

const updateWorkspace = async (req, res, next) => {
  try {
    const { name, logoUrl, timezone, language } = req.body
    if (name     !== undefined) workspaceSettings.name     = name
    if (logoUrl  !== undefined) workspaceSettings.logoUrl  = logoUrl
    if (timezone !== undefined) workspaceSettings.timezone = timezone
    if (language !== undefined) workspaceSettings.language = language
    return success(res, workspaceSettings, 'Cập nhật workspace thành công')
  } catch (err) { next(err) }
}

const updatePasswordPolicy = async (req, res, next) => {
  try {
    workspaceSettings.passwordPolicy = {
      ...workspaceSettings.passwordPolicy,
      ...req.body,
    }
    return success(res, workspaceSettings, 'Cập nhật chính sách mật khẩu thành công')
  } catch (err) { next(err) }
}

const updateFeatures = async (req, res, next) => {
  try {
    workspaceSettings.features = {
      ...workspaceSettings.features,
      ...req.body.features,
    }
    return success(res, workspaceSettings, 'Cập nhật tính năng thành công')
  } catch (err) { next(err) }
}

module.exports = { getWorkspace, updateWorkspace, updatePasswordPolicy, updateFeatures }
