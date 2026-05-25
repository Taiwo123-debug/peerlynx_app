const userType = sessionStorage.getItem("userType");
const email = sessionStorage.getItem("email");
const homeBtn = document.querySelector(".homeBtn");
const editImageBtn = document.querySelector(".editImageBtn");
const imageInput = document.querySelector(".imageInput");
const profilePicture = document.querySelector(".profilePicture");
const firstName = document.querySelector(".firstName");
const lastName = document.querySelector(".lastName");
const university = document.querySelector(".university");
const mobile = document.querySelector(".mobile");
const editMessage = document.querySelector(".editMessage");
const editBtn = document.querySelector(".editBtn");

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
            
            // profilePicture.src = user.profile_picture
            //     ? `http://10.0.2.2:3000${user.profile_picture}`
            //     : "./assets/images/no-image.png";

            // profilePicture.onerror = () => {
            //     profilePicture.src = "./assets/images/no-image.png";
            // };
        }

        firstName.value = user.first_name;
        lastName.value = user.last_name;
        university.value = user.university;
        mobile.value = user.mobile;
        homeBtn.href = `${user.user_type}-home.html`;
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    getUserData();
});

// edit profile picture
editImageBtn.addEventListener("click", ()=>{
    imageInput.click();
})
imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // preview image
    const imageUrl = URL.createObjectURL(file);
    profilePicture.src = imageUrl;


    // send to server
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("email", email);
    const url = "https://peerlynx-server.onrender.com/upload-profile-picture";
    // const url = "http://10.0.2.2:3000/upload-profile-picture";

    try {
        const response = await fetch(url,
            {
                method: "POST",
                body: formData
            }
        );
        const data = await response.json();
    }
    catch (error) {
        console.error("Upload error:", error);
    }
});

// validate form 
firstName.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z]/g, "");
    e.target.value = value;
});

lastName.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z]/g, "");
    value = value.slice(0, 30);
    e.target.value = value;
});

university.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.slice(0, 100);
    e.target.value = value;
});

mobile.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.slice(0, 15);
    e.target.value = value;
});

// save changes
editBtn.addEventListener("click", async()=>{
    let first = firstName.value.trim();
    let last = lastName.value.trim();
    let uni = university.value.trim();
    let mobi = mobile.value.trim();
    if (first == "" || last == "") {
        editMessage.textContent = "Enter first name and last name";
    }
    else {
        await saveChanges(first, last, uni, mobi);
    }
})

// send to server
async function saveChanges(first, last, uni, mobi) {
    const url = `https://peerlynx-server.onrender.com/edit-profile?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/edit-profile?email=${encodeURIComponent(email)}`;

    try {
        editMessage.textContent = "Updating account...";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                first_name: first,
                last_name: last,
                university: uni,
                mobile: mobi,
                email: email
            })
        });
        const data = await response.json();

        if (data.success) {
            editMessage.textContent = data.message;
        }
        else {
            editMessage.textContent = data.message;
        }
    }
    catch(error) {
        editMessage.textContent = "Profile update error";
    }
}
