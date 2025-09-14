// Mock implementation for web platform
export const setNotificationHandler = (handler: any) => {
  // No-op for web
};

export const requestPermissionsAsync = async () => {
  return { status: 'denied' as const };
};

export const scheduleNotificationAsync = async (notificationRequest: any) => {
  // Return a mock notification ID for web
  return 'web-mock-notification-id';
};