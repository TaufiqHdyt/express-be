const roleData = [
  {
    name: 'Admin',
    path: ['/'],
  },
  {
    name: 'User',
  },
  {
    name: 'Guest',
    path: [
      '/api/inquiry',
      '/api/contact',
      '/feed',
    ],
  },
];

export { roleData };
