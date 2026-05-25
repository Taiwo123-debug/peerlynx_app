import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// This is your Splash Screen logic
async function checkUserStatus() {
    try {
        console.log("Checking user status on:", Capacitor.getPlatform());

        // 1. Capacitor automatically handles Web (localStorage) vs Native (Storage)
        const { value } = await Preferences.get({ key: 'newUser' });

        if (value === null) {
            // CASE: First time opening the app
            // We set it to 'false' so next time they are a "returning user"
            await Preferences.set({ key: 'newUser', value: 'false' });
            
            setTimeout(() => { 
                window.location.href = 'carousel.html'; 
            }, 2000);
        } 
        else {
            // CASE: Returning user
            window.location.href = 'sign-in.html';
        }
    }
    catch (err) {
        console.error("Storage Error:", err);
        window.location.href = 'sign-in.html';
    }
}

// 2. Optimized load listener
window.addEventListener('load', () => {
    // Keep the splash screen visible for 1 second before checking
    setTimeout(checkUserStatus, 1000);
});