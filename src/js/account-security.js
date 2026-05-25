const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const password1 = document.querySelector(".password1");
const password2 = document.querySelector(".password2");
const togglePasswordBtn = document.querySelector(".togglePasswordBtn");
const eyeClose = document.querySelector(".eyeClose");
const eyeOpen = document.querySelector(".eyeOpen");
const passwordMessage = document.querySelector(".passwordMessage");
const passwordWrapper = document.querySelector(".passwordWrapper");
const passwordChangeBtn = document.querySelector(".passwordChangeBtn");
const categoryBtn = document.querySelector(".categoryBtn");

if (userType == "student") {
    categoryBtn.style.display = "grid";
}

password1.addEventListener("input", () => {
    password1.value = password1.value.replace(/[^a-zA-Z0-9@#$%^&*!_.-]/g, "");
});

password2.addEventListener("input", () => {
    password2.value = password2.value.replace(/[^a-zA-Z0-9@#$%^&*!_.-]/g, "");
});

togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (password1.type === "password") {
        password1.type = "text";
        password2.type = "text";
        eyeOpen.style.display = "none";
        eyeClose.style.display = "block";
    }
    else {
        password1.type = "password";
        password2.type = "password";
        eyeClose.style.display = "none";
        eyeOpen.style.display = "block";
    }
});

password1.addEventListener("focus", () => passwordWrapper.style.borderColor = "#a370f7");
password1.addEventListener("blur", () => passwordWrapper.style.borderColor = "grey");

// server
async function updatePassword(password) {
    const url = `https://peerlynx-server.onrender.com/update-password?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/update-password?email=${encodeURIComponent(email)}`;
    try {
        passwordMessage.textContent = "Updating password...";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password,
                email: email
            })
        });
        const data = await response.json();

        if (data.success) {
            passwordMessage.textContent = data.message;
            password1.value = "";
            password2.value = "";
        }
        else {
            passwordMessage.textContent = data.message;
        }
    }
    catch(error) {
        passwordMessage.textContent = "Password change error";
    }
}

// form validation and submission
passwordChangeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    let p1 = password1.value.trim();
    let p2 = password2.value.trim();
    if (!p1 || !p2) {
        passwordMessage.textContent = "Enter and confirm passwords";
        return;
    }
    else if (p1 !== p2) {
        passwordMessage.textContent = "Passwords do not match";
        return;
    }
    else if (p1.length < 6 || p2.length < 6) {
        passwordMessage.textContent = "Password is too short";
        return;
    }

    await updatePassword(p1);
});