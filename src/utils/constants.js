export const ORDER_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  DELIVERED: 'Delivered',
};

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

export const MALE_MEASUREMENTS = [
  { key: 'neck', label: 'Neck', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hip', label: 'Hip', unit: 'cm' },
  { key: 'shoulder', label: 'Shoulder', unit: 'cm' },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'cm' },
  { key: 'trouserLength', label: 'Trouser Length', unit: 'cm' },
];

export const FEMALE_MEASUREMENTS = [
  { key: 'bust', label: 'Bust', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hip', label: 'Hip', unit: 'cm' },
  { key: 'shoulder', label: 'Shoulder', unit: 'cm' },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'cm' },
];

export const FABRIC_TYPES = [
  'Ankara',
  'Lace',
  'Cotton',
  'Silk',
  'Chiffon',
  'Damask',
  'Adire',
  'Aso-Oke',
  'Guinea Brocade',
  'Velvet',
  'Satin',
  'Polyester',
  'Wool',
  'Denim',
  'Linen',
];

export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'HiHome',
    roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER],
  },
  {
    path: '/customers',
    label: 'Customers',
    icon: 'HiUsers',
    roles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/measurements',
    label: 'Measurements',
    icon: 'HiRulerHorizontal',
    roles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: 'HiClipboardDocumentList',
    roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER],
  },
  {
    path: '/payments',
    label: 'Payments',
    icon: 'HiBanknotes',
    roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'HiChartBar',
    roles: [ROLES.ADMIN],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'HiCog6Tooth',
    roles: [ROLES.ADMIN],
  },
];

export const STATUS_COLORS = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
  'In Progress': { bg: 'bg-sky-100', text: 'text-sky-800' },
  Ready: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  Delivered: { bg: 'bg-violet-100', text: 'text-violet-800' },
};

export const ITEMS_PER_PAGE = 10;
