import { PushNotifications } from '@capacitor/push-notifications';

async function setupPushNotifications() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        throw new Error('Notification permission not granted');
    }
    await PushNotifications.register();
}

PushNotifications.addListener(
    'registration',
    token => {
        console.log('FCM TOKEN:', token.value);
        // send token to backend
        saveTokenToServer(token.value);
    }
);

async function saveTokenToServer(token) {
    try {
        const url = "https://peerlynx-server.onrender.com/save-fcm-token";
        // const url = "http://10.0.2.2:3000/save-fcm-token";

        const userEmail = sessionStorage.getItem("email");
        await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: userEmail,
                    token: token
                })
            }
        );
        console.log("FCM token saved");
    }
    catch (error) {
        alert(error);
        console.error("Save token error:", error);
    }
}

setupPushNotifications();