const email = sessionStorage.getItem("email"); 
const studentBtn = document.querySelector(".studentBtn");
const tutorBtn = document.querySelector(".tutorBtn");
const continueBtn = document.querySelector(".continueBtn");
const userTypeMessage = document.querySelector(".userTypeMessage");

if (!email) {
    window.location.href = "sign-up.html";
}

let userType = null;
studentBtn.addEventListener("click", () => {
    setUserType("student", studentBtn, tutorBtn);
});

tutorBtn.addEventListener("click", () => {
    setUserType("tutor", tutorBtn, studentBtn);
});


function setUserType(user, selectedBtn, otherBtn) {
    userType = user;
    selectedBtn.classList.add("chosen");
    otherBtn.classList.remove("chosen");
    userTypeMessage.style.opacity = 0;
}

continueBtn.addEventListener("click", async () => {

    const url = "https://peerlynx-server.onrender.com/set-usertype";
    // const url = "http://10.0.2.2:3000/set-usertype";
    
    if (!userType) {
        showUserTypeWarning();
        return;
    }
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
            sessionStorage.setItem("userType", userType);
            window.location.href = "choose-school.html";
        }
    }
    catch (err) {
        console.error("Error saving userType:", err);
    }
});

function showUserTypeWarning() {
    let x = 0;
    const interval = setInterval(() => {
        x += 0.1;
        userTypeMessage.style.opacity = x;
        if (x >= 1) {
            clearInterval(interval); x = 1;
            setTimeout(() => {
                userTypeMessage.style.opacity = 0;
            }, 3000);
        }
    }, 40);
}