import { useAuth } from './useAuth'

export function usePermission(project) {
  const { user } = useAuth()

  if (!user) return { isAdmin: false, isPM: false, isMember: false, canEdit: false }

  const isAdmin = user.role === 'admin'

  const membership = project?.members?.find(
    m => (m.user?._id || m.user) === user._id
  )

  const isPM = isAdmin ||
    (membership?.role === 'pm') ||
    project?.owner?._id === user._id ||
    project?.owner === user._id

  const isMember = isAdmin || isPM || !!membership

  return {
    isAdmin,
    isPM,
    isMember,
    canEdit:         isPM,   // Sửa project, tạo/xoá cột
    canDeleteProject: isAdmin, // Chỉ admin xoá project
    canManageMembers: isPM,  // Quản lý thành viên
    canCreateCard:   isMember, // Tạo thẻ
    canDeleteCard:   isPM,   // Xoá thẻ
  }
}
