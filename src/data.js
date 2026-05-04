// Màu nhãn
export const LABEL_COLORS = [
  { id: 'red',    bg: '#ef4444', name: 'Đỏ' },
  { id: 'green',  bg: '#22c55e', name: 'Xanh lá' },
  { id: 'yellow', bg: '#eab308', name: 'Vàng' },
  { id: 'blue',   bg: '#3b82f6', name: 'Xanh dương' },
  { id: 'purple', bg: '#a855f7', name: 'Tím' },
]

export const PRIORITY = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp']

export const INITIAL_LISTS = [
  {
    id: 'today',
    title: 'Hôm Nay',
    cards: [
      {
        id: 'c1', label: 'red',
        title: 'Cập nhật báo cáo tiến độ sprint Q2',
        description: 'Tổng hợp kết quả sprint, cập nhật burndown chart và gửi cho PM.',
        tag: 'Dev', due: '2026-04-09', priority: 'Khẩn cấp',
        avatars: [
          { letter: 'A', gradient: 'linear-gradient(135deg,#ef4444,#f97316)' },
          { letter: 'B', gradient: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' },
        ],
      },
      {
        id: 'c2', label: 'green',
        title: 'Review pull request cho module thanh toán',
        description: 'Kiểm tra logic xử lý thanh toán và bảo mật token.',
        tag: 'Backend', due: '2026-04-09', priority: 'Cao',
        avatars: [
          { letter: 'C', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
        ],
      },
      {
        id: 'c3', label: 'blue',
        title: 'Họp stand-up với team lúc 9:00 AM',
        description: '',
        tag: 'Meeting', due: '2026-04-09', priority: 'Trung bình',
        avatars: [],
      },
    ],
  },
  {
    id: 'thisweek',
    title: 'Tuần Này',
    cards: [
      {
        id: 'c4', label: 'yellow',
        title: 'Thiết kế UI dashboard analytics mới',
        description: 'Wireframe và prototype cho trang analytics, phải đáp ứng responsive.',
        tag: 'Design', due: '2026-04-12', priority: 'Cao',
        avatars: [
          { letter: 'D', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
          { letter: 'E', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
        ],
      },
      {
        id: 'c5', label: 'purple',
        title: 'Tích hợp API bên thứ 3 cho hệ thống CRM',
        description: 'Kết nối Salesforce API, xử lý OAuth2 và đồng bộ dữ liệu khách hàng.',
        tag: 'Integration', due: '2026-04-14', priority: 'Cao',
        avatars: [
          { letter: 'F', gradient: 'linear-gradient(135deg,#a855f7,#8b5cf6)' },
        ],
      },
      {
        id: 'c6', label: 'green',
        title: 'Viết unit test cho authentication module',
        description: 'Coverage tối thiểu 80%, bao gồm edge case token hết hạn.',
        tag: 'Testing', due: '2026-04-11', priority: 'Trung bình',
        avatars: [],
      },
      {
        id: 'c7', label: 'blue',
        title: 'Deploy phiên bản v2.3.1 lên staging',
        description: 'Chạy migration DB, kiểm tra smoke test sau deploy.',
        tag: 'DevOps', due: '2026-04-10', priority: 'Cao',
        avatars: [
          { letter: 'G', gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
          { letter: 'H', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
        ],
      },
    ],
  },
  {
    id: 'later',
    title: 'Sau Này',
    cards: [
      {
        id: 'c8', label: 'red',
        title: 'Lên kế hoạch roadmap Q3 2026',
        description: 'Phân tích feedback Q2, xác định epic và milestone cho Q3.',
        tag: 'Planning', due: '2026-06-01', priority: 'Trung bình',
        avatars: [
          { letter: 'I', gradient: 'linear-gradient(135deg,#ef4444,#a855f7)' },
        ],
      },
      {
        id: 'c9', label: 'yellow',
        title: 'Nghiên cứu chuyển đổi sang microservices',
        description: 'Đánh giá chi phí, rủi ro và lộ trình migration từ monolith.',
        tag: 'Research', due: '2026-05-15', priority: 'Thấp',
        avatars: [
          { letter: 'J', gradient: 'linear-gradient(135deg,#eab308,#f97316)' },
          { letter: 'K', gradient: 'linear-gradient(135deg,#3b82f6,#a855f7)' },
        ],
      },
    ],
  },
]
