const otpDigits = document.querySelectorAll(".otpDigit");
const OTPLoginBtn = document.querySelector(".OTPLoginBtn");
const signMessage = document.querySelector(".signMessage");

// get email and user type from session
const userEmail = sessionStorage.getItem("resetEmail");
const userType = sessionStorage.getItem("resetUserType");
// redirect back if missing
if (!userEmail || !userType) {
    window.location.href = "verify-email.html";
}

// handle Input auto-forward and backspace
otpDigits.forEach((input, index) => {
    // only allow numbers
    input.addEventListener("input", (e) => {
        const value = e.target.value;
        // clean input to ensure only 1 digit
        e.target.value = value.replace(/[^0-9]/g, "").substring(0, 1);

        // move to next input if a digit was entered
        if (e.target.value && index < otpDigits.length - 1) {
            otpDigits[index + 1].focus();
        }
    });

    // handle backspace to move backwards
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            otpDigits[index - 1].focus();
        }
    });
});

// verify otp in server
async function verifyOtp(otp) {
    const url = "https://peerlynx-server.onrender.com/verify-otp";
    // const url = "http://10.0.2.2:3000/verify-otp";

    try {
        const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: userEmail,
                    otp: otp
                })
            }
        );
        const data = await response.json();

        if (data.success) {
            alert(`${userType} 0`);
            if (userType === "student") {
                window.location.href = "student-home.html";
            }
            else if (userType === "tutor") {
                window.location.href = "tutor-home.html";
            }
            sessionStorage.removeItem("resetEmail");
            sessionStorage.removeItem("resetUserType");
        }
        else {
            signMessage.textContent = data.message;
        }
    }
    catch (err) {
        console.error(err);
        signMessage.textContent = "Server error";
    }
}

// submit and Verify
OTPLoginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    signMessage.textContent = "";

    // Concatenate all 5 values
    let otp = "";
    otpDigits.forEach(input => otp += input.value);

    if (otp.length < 5) {
        signMessage.textContent = "Please enter 5-digit code";
        return;
    }
    await verifyOTP(otp);
});
