import { LocalNotifications } from '@capacitor/local-notifications';

async function requestNotificationPermission() {
    const permission = await LocalNotifications.requestPermissions();
}

requestNotificationPermission();