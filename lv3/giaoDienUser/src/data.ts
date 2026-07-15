import { Invoice, MaintenanceRequest, TenantNotification, Amenity } from './types';

export const initialInvoices: Invoice[] = [
  {
    id: 'MR-1023',
    month: 'October 2023',
    dueDate: 'Oct 05, 2023',
    rent: 2500.00,
    electricity: 120.50,
    water: 45.00,
    total: 2665.50,
    status: 'Pending',
  },
  {
    id: 'MR-0923',
    month: 'September 2023',
    dueDate: 'Sep 05, 2023',
    paidDate: 'Sep 02, 2023',
    rent: 2500.00,
    electricity: 115.20,
    water: 42.00,
    total: 2657.20,
    status: 'Paid',
  },
  {
    id: 'MR-0823',
    month: 'August 2023 (Late Fee)',
    dueDate: 'Aug 05, 2023',
    rent: 0,
    electricity: 0,
    water: 0,
    fee: 50.00,
    total: 50.00,
    status: 'Overdue',
  }
];

export const initialRequests: MaintenanceRequest[] = [
  {
    id: 'MR-4921',
    title: 'HVAC not cooling',
    category: 'HVAC / AC',
    priority: 'Medium',
    description: 'The air conditioning in the master bedroom has stopped blowing cold air. It only circulates room temperature air.',
    submittedAt: 'Oct 12, 2023',
    status: 'In Progress',
    techName: 'Mike',
    photos: [],
    updates: [
      {
        title: 'Request Submitted',
        time: 'Oct 12, 09:30 AM',
        description: 'Your request has been received and is awaiting technical assignment.'
      },
      {
        title: 'In Progress',
        time: 'Oct 12, 11:15 AM',
        description: 'Assigned to Tech: Mike. Technician is preparing parts.'
      }
    ]
  },
  {
    id: 'MR-4923',
    title: 'Dishwasher leak',
    category: 'Appliances',
    priority: 'Medium',
    description: 'Water is pooling at the base of the dishwasher during the rinse cycle.',
    submittedAt: 'Oct 14, 2023',
    status: 'Submitted',
    photos: [],
    updates: [
      {
        title: 'Request Submitted',
        time: 'Oct 14, 02:45 PM',
        description: 'Awaiting assignment'
      }
    ]
  }
];

export const initialNotifications: TenantNotification[] = [
  {
    id: 'n1',
    title: 'Hóa đơn tháng 10 đã sẵn sàng',
    description: 'Vui lòng thanh toán trước ngày 05/10 để tránh phí phạt.',
    type: 'invoice',
    time: '01/10/2023',
    isRead: false
  },
  {
    id: 'n2',
    title: 'Bảo trì thang máy 10/10',
    description: 'Thang máy A sẽ tạm ngưng hoạt động từ 08:00 đến 12:00.',
    type: 'system',
    time: '08/10/2023',
    isRead: false
  }
];

export const amenities: Amenity[] = [
  {
    id: 'gym',
    name: 'Phòng Gym Cao Cấp',
    description: 'Gym đầy đủ trang thiết bị hiện đại, tạ rời và khu cardio hướng nhìn ra thành phố.',
    iconName: 'Dumbbell',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
    capacity: 'Tối đa 15 người/lượt',
    rules: 'Yêu cầu giày thể thao, mang theo khăn cá nhân.'
  },
  {
    id: 'pool',
    name: 'Hồ Bơi Vô Cực',
    description: 'Hồ bơi nước ấm tầng thượng với ghế tắm nắng và quầy bar tự phục vụ.',
    iconName: 'Waves',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=600',
    capacity: 'Tối đa 25 người/lượt',
    rules: 'Mặc đồ bơi đúng quy định, không mang đồ thủy tinh.'
  },
  {
    id: 'bbq',
    name: 'Khu Tiệc Nướng BBQ',
    description: 'Bếp nướng ngoài trời cao cấp với bàn ăn gia đình và bồn rửa tiện lợi.',
    iconName: 'Flame',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
    capacity: 'Tối đa 10 người/khu',
    rules: 'Đặt trước tối thiểu 24h, tự dọn dẹp sau khi sử dụng.'
  },
  {
    id: 'lounge',
    name: 'Phòng Hội Nghị & Sinh Hoạt',
    description: 'Không gian yên tĩnh lý tưởng để làm việc nhóm, tổ chức sinh nhật hoặc họp gia đình.',
    iconName: 'Users',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&q=80&w=600',
    capacity: 'Tối đa 20 người',
    rules: 'Đăng ký trước với Ban quản lý, không gây ồn ào sau 22:00.'
  }
];
