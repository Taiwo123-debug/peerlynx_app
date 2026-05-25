const firstName = document.querySelector(".firstName");
const lastName = document.querySelector(".lastName");
const email = document.querySelector(".email");
const passwordWrapper = document.querySelector(".passwordWrapper");
const password = document.querySelector(".password");
const togglePasswordBtn = document.querySelector(".togglePasswordBtn");
const eyeClose = document.querySelector(".eyeClose");
const eyeOpen = document.querySelector(".eyeOpen");
const signUpBtn = document.querySelector(".signUpBtn");
const signMessage = document.querySelector(".signMessage");

// input filtering
firstName.addEventListener("input", () => {
    firstName.value = firstName.value.replace(/[^a-zA-Z]/g, "");
});

lastName.addEventListener("input", () => {
    lastName.value = lastName.value.replace(/[^a-zA-Z]/g, "");
});

email.addEventListener("input", () => {
    email.value = email.value.replace(/[^a-zA-Z0-9@._+-]/g, "");
});

password.addEventListener("input", () => {
    password.value = password.value.replace(/[^a-zA-Z0-9@#$%^&*!_.-]/g, "");
});

// ui logic
togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
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

password.addEventListener("focus", () => passwordWrapper.style.borderColor = "#a370f7");
password.addEventListener("blur", () => passwordWrapper.style.borderColor = "grey");

// send form data
async function submitForm(fname, lname, mail, pass) {
    const url = "https://peerlynx-server.onrender.com/sign-up";
    // const url = "http://10.0.2.2:3000/sign-up";
    try {
        signMessage.textContent = "Creating account...";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                first_name: fname,
                last_name: lname,
                email: mail,
                password: pass
            })
        });
        const data = await response.json();

        if (data.success) {
            signMessage.textContent = data.message;
            sessionStorage.setItem("email", data.email);
            setTimeout(() => {
                window.location.href = "user-type.html";
            }, 1000);
        }
        else {
            signMessage.textContent = data.message;
        }
    }
    catch (err) {
        signMessage.textContent = "Server connection error";
    }
}

// form validation and submission
signUpBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!firstName.value || !lastName.value || !email.value || !password.value) {
        signMessage.textContent = "Enter all fields";
        return;
    }
    else if (password.value.length < 6) {
        signMessage.textContent = "Password is too short";
        return;
    }

    await submitForm(
        firstName.value.trim(),
        lastName.value.trim(),
        email.value.trim().toLowerCase(),
        password.value.trim()
    );
});