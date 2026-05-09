const { success, error } = require('../utils/response')

// Lưu workspace settings trong memory (production dùng DB riêng)
// Cấu trúc đơn giản — có thể mở rộng thành Mongoose model sau
let workspaceSettings = {
  name:        'PMS Workspace',
  logoUrl:     '',
  timezone:    'Asia/Ho_Chi_Minh',
  language:    'vi',
  // UC36: chính sách mật khẩu
  passwordPolicy: {
    minLength:       6,
    requireUppercase: false,
    requireNumber:   false,
    sessionTimeout:  480, // phút
  },
  // UC36: bật/tắt tính năng
  features: {
    chat:    true,
    finance: true,
    sprint:  true,
    report:  true,
  },
}

// UC10, UC35: Lấy cấu hình workspace
const getWorkspace = async (req, res, next) => {
  try {
    return success(res, workspaceSettings)
  } catch (err) { next(err) }
}

// UC10, UC35: Cập nhật workspace — chỉ Admin
const updateWorkspace = async (req, res, next) => {
  try {
    const { name, logoUrl, timezone, language } = req.body
    if (name !== undefined) workspaceSettings.name = name
    if (logoUrl !== undefined) workspaceSettings.logoUrl = logoUrl
    if (timezone !== undefined) workspaceSettings.timezone = timezone
    if (language !== undefined) workspaceSettings.language = language

    return success(res, workspaceSettings, 'Cập nhật workspace thành công')
  } catch (err) { next(err) }
}

// UC36: Cập nhật chính sách mật khẩu — chỉ Admin
const updatePasswordPolicy = async (req, res, next) => {
  try {
    const { minLength, requireUppercase, requireNumber, sessionTimeout } = req.body
    workspaceSettings.passwordPolicy = {
      ...workspaceSettings.passwordPolicy,
      ...(minLength !== undefined && { minLength }),
      ...(requireUppercase !== undefined && { requireUppercase }),
      ...(requireNumber !== undefined && { requireNumber }),
      ...(sessionTimeout !== undefined && { sessionTimeout }),
    }
    return success(res, workspaceSettings, 'Cập nhật chính sách mật khẩu thành công')
  } catch (err) { next(err) }
}

// UC36: Bật/tắt tính năng — chỉ Admin
const updateFeatures = async (req, res, next) => {
  try {
    const { features } = req.body
    workspaceSettings.features = {
      ...workspaceSettings.features,
      ...features,
    }
    return success(res, workspaceSettings, 'Cập nhật tính năng thành công')
  } catch (err) { next(err) }
}

module.exports = { getWorkspace, updateWorkspace, updatePasswordPolicy, updateFeatures }
