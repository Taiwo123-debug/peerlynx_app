import { Preferences } from '@capacitor/preferences';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const yesDelete = document.querySelector(".yesDelete");
const categoryBtn = document.querySelector(".categoryBtn");

if (userType == "student") {
    categoryBtn.style.display = "grid";
}

yesDelete.addEventListener("click", async()=>{  
    const url = "https://peerlynx-server.onrender.com/delete-account";
    // const url = "http://10.0.2.2:3000/delete-account";
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
             body: JSON.stringify({
                email: email,
                user_type: userType
            })
        });
        const data = await response.json();

        if (data.success) {
            // clear web storage 
            sessionStorage.clear();
            localStorage.clear();

            // check capacitor preferences first and clear app storage
            const preferences = await Preferences.keys();
            if (preferences.keys.length > 0) {
                await Preferences.clear();
            }

            // delete sqlite database
            await CapacitorSQLite.deleteDatabase({
                database: "peerlynx_db"
            });
        }
        else {
            alert(data.message || "Delete account failed");
        }
    }
    catch(error) {
        alert("failed to delete account");
    }
    finally {
        window.location.href = "index.html";
    }
})