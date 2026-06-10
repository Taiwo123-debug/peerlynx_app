import { Share } from '@capacitor/share';

const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

const signOutAsk = document.querySelector(".signOutAsk");
const signOutQuestion = document.querySelector(".signOutQuestion");
const yesSignOut = document.querySelector(".yesSignOut");
const noSignOut = document.querySelector(".noSignOut");
const userTypeEl = document.querySelector(".userType");
const profilePicture = document.querySelector(".profilePicture");
const fullName = document.querySelector(".fullName");
const emailEl = document.querySelector(".email");
const homeBtn = document.querySelector(".homeBtn");
const viewTutorSkills = document.querySelector(".viewTutorSkills");
const trackStudentProgress = document.querySelector(".trackStudentProgress");
const toggle = document.getElementById("toggle");
const toggleText = document.querySelector(".toggleText");
const shareApp = document.querySelector(".shareApp");

userTypeEl.textContent = userType;
emailEl.textContent = email;

if (userType == "tutor") {
    viewTutorSkills.style.display = "block";
}
else if (userType == "student") {
    trackStudentProgress.style.display = "block";
}

//get user data
async function getUserData() {
    const url = `https://peerlynx-server.onrender.com/user-data?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/user-data?email=${encodeURIComponent(email)}`;

    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            alert("User not found");
            return;
        }
        const user = data.data;

        if (user.profile_picture) {
            profilePicture.src = user.profile_picture
                ? `https://peerlynx-server.onrender.com${user.profile_picture}`
                : "./assets/images/no-image.png";

            profilePicture.onerror = () => {
                profilePicture.src = "./assets/images/no-image.png";
            };

            //  profilePicture.src = user.profile_picture
            //     ? `http://10.0.2.2:3000${user.profile_picture}`
            //     : "./assets/images/no-image.png";

            // profilePicture.onerror = () => {
            //     profilePicture.src = "./assets/images/no-image.png";
            // };
        }
       
        fullName.textContent = `${user.first_name} ${user.last_name}`.trim();
        homeBtn.href = `${user.user_type}-home.html`;
        const notify = user.notify === 1;
        sessionStorage.setItem("userType", user.user_type);
        noficationFunction(notify);
        sessionStorage.setItem("notify", notify);
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    getUserData();
});

// sign out 
signOutAsk.addEventListener("click", ()=>{
    signOutQuestion.style.display = "block";
    signOutAsk.style.display = "none";
})

noSignOut.addEventListener("click", ()=>{
    signOutAsk.style.display = "block";
    signOutQuestion.style.display = "none";
})

// sign out
yesSignOut.addEventListener("click", async () => {
    noSignOut.click();
    setTimeout( async()=>{
        try {
            const url = "https://peerlynx-server.onrender.com/sign-out";
            // const url = "http://10.0.2.2:3000/sign-out";
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            if (data.success) {
                sessionStorage.clear();
                window.location.href = "sign-in.html";
            }
            else {
                alert(data.message || "Sign out failed");
            }
        }
        catch (error) {
            alert("Failed to sign out");
        }
    }, 1000)
});

function noficationFunction(status) {
    if (status) {
        toggle.classList.remove("off");
        toggle.classList.add("on");
        toggleText.textContent = "ON";
        toggle.style.textAlign = "left";
    }
    else {
        toggle.classList.remove("on");
        toggle.classList.add("off");
        toggleText.textContent = "OFF";
        toggle.style.textAlign = "right";
    }
}

// toggle notification
toggle.addEventListener("click", () => {
    let text = toggleText.textContent.toLocaleLowerCase();
    if (text == "on") {
        updateNotification(false);
    }
    else {
        updateNotification(true);
    }
});

// update notification in server
async function updateNotification(status) {
    const url = "https://peerlynx-server.onrender.com/update-notification";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                notify: status
            })
        });
        const data = await response.json();
        
        if (data.success) {
            noficationFunction(status);
            sessionStorage.setItem("notify", status);
        }
    }
    catch (err) {
        console.error("Error saving userType:", err);
    }
}

// copy link
shareApp.addEventListener("click", async () => {
    try {
        await Share.share({
            title: 'PeerLynx - Connect and Learn',
            text: 'Check out this app',
            url: shareApp.getAttribute("data-link"),
            dialogTitle: 'Share with'
        });
    }
    catch (err) {}
});