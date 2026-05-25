const emailInput = document.querySelector(".email");
const verifyEmailBtn = document.querySelector(".verifyEmailBtn");
const signMessage = document.querySelector(".signMessage");

emailInput.addEventListener("input", () => {
    emailInput.value = emailInput.value.replace(/[^a-zA-Z0-9@._+-]/g, "");
});

emailInput.addEventListener("focus", () => {
    signMessage.textContent = "";
});

// send email for verification
async function verifyEmail(email) {
    const url = "https://peerlynx-server.onrender.com/verify-email";
    // const url = "http://10.0.2.2:3000/verify-email";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (data.success) {
            signMessage.textContent = "Sending OTP...";
            sessionStorage.setItem("resetEmail", data.email);
            sessionStorage.setItem("resetUserType", data.user_type);
            window.location.href = data.route;
        }
        else {
            signMessage.textContent = data.message;
        }
    }
    catch(err) {
        signMessage.textContent = "Server error. Try again later";
    }
}

verifyEmailBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    let e = emailInput.value.trim();
    
    if (!e) {
        signMessage.textContent = "Enter your email address";
        return;
    }
    await verifyEmail(e);
});
