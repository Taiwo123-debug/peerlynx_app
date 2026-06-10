const email = document.querySelector(".email");
const passwordWrapper = document.querySelector(".passwordWrapper");
const password = document.querySelector(".password");
const togglePasswordBtn = document.querySelector(".togglePasswordBtn");
const eyeClose = document.querySelector(".eyeClose");
const eyeOpen = document.querySelector(".eyeOpen");
const signMessage = document.querySelector(".signMessage");
const signInBtn = document.querySelector(".signInBtn");

// IMPORTANT: reset per-user local data
localStorage.removeItem("unreadMap");
localStorage.removeItem("openChat");

// Input Filtering & UI
email.addEventListener("input", () => {
    email.value = email.value.replace(/[^a-zA-Z0-9@._+-]/g, "");
});

password.addEventListener("focus", () => {
    passwordWrapper.style.borderColor = "#a370f7";
});

password.addEventListener("blur", () => {
    passwordWrapper.style.borderColor = "grey";
});

togglePasswordBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (password.type === "password") {
        password.type = "text";
        eyeOpen.style.display = "none";
        eyeClose.style.display = "block";
    }
    else {
        password.type = "password";
        eyeClose.style.display = "none";
        eyeOpen.style.display = "block";
    }
});

// submit login data

async function loginForm(mail, pass) {
const url = "https://peerlynx-server.onrender.com/sign-in";
// const url = "http://10.0.2.2:3000/sign-in";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: mail,
                password: pass,
            })
        });
        const data = await response.json();

        // login sucess
        if (data.success) {
            sessionStorage.setItem("loginTrue", data.loginTrue);
            sessionStorage.setItem("email", data.email);
            sessionStorage.setItem("userType", data.user_type);
            setTimeout(() => {
                window.location.href = data.route;
            }, 500);
        }
        else {
            signMessage.textContent = data.message;
        }
    }
    catch (err) {
        alert(err);
        signMessage.textContent = "Server connection error";
    }
}

// form validation
signInBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!email.value || !password.value) {
        signMessage.textContent = "Enter email and password";
        return;
    }

    await loginForm(
        email.value.trim().toLowerCase(),
        password.value.trim(),
    );
});
