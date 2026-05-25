import { LocalNotifications } from '@capacitor/local-notifications';

export async function showMessageNotification(messageData) {
    await LocalNotifications.schedule({
        notifications: [
            {
                title: messageData.senderName,
                body: messageData.message,
                id: Date.now(),
                schedule: {
                    at: new Date(Date.now() + 100)
                },
                sound: undefined,
                attachments: undefined,
                actionTypeId: "",
                extra: {
                    senderEmail: messageData.senderEmail
                }
            }
        ]
    });
}

export async function openNotification(senderEmail, senderName, senderImage) {
    LocalNotifications.addListener("localNotificationActionPerformed",
        (notification) => {
            console.log(notification);
            const senderEmail = notification.notification.extra.senderEmail;
            // redirect
            window.location.href =  `messenger.html?email=${senderEmail}&recipient-name=${senderName}&recipient-image=${senderImage}`
        }
    );
} 