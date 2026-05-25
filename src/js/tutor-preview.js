// session
const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// recipient
const params = new URLSearchParams(window.location.search);
const recipientEmail = decodeURIComponent(params.get("recipient-email"));
const recipientName = decodeURIComponent(params.get("recipient-name"));
const recipientImage = decodeURIComponent(params.get("recipient-image"));

const windowHistory = document.querySelector(".windowHistory");
const backToChat = document.querySelector(".backToChat");

windowHistory.addEventListener("click", ()=>{
    window.history.back();
})

backToChat.addEventListener("click", ()=>{
    let url = `messenger.html?recipient-email=${encodeURIComponent(params.get("recipient-image"))}&recipient-name=${encodeURIComponent(recipientName)}&recipient-image=${encodeURIComponent(recipientImage)}`;
    window.location.href = url;
})

const recipientPictureEl = document.querySelector(".recipientPicture");
const recipientNameEl = document.querySelector(".recipientName");
const recipientSchool = document.querySelector(".recipientSchool");
const recipientEmailEl = document.querySelector(".recipientEmailEl");
const recipientMobileEl = document.querySelector(".recipientMobileEl");

recipientNameEl.textContent = `${recipientName} (tutor)`;
recipientPictureEl.src = recipientImage;
recipientEmailEl.href = `mailto://${recipientEmail}`;

const tutorSkills = document.querySelector(".tutorSkills");
const joinedEl = document.querySelector(".joinedEl");

// get tutor skills
async function getTutorSkills() {
const url = `https://peerlynx-server.onrender.com/tutor-skills?email=${encodeURIComponent(recipientEmail)}`;
    // const url = `http://10.0.2.2:3000/tutor-skills?email=${encodeURIComponent(recipientEmail)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const skillsContainer = document.querySelector(".skillsContainer");
        skillsContainer.innerHTML = "";
        if (!data.success) {
            alert(0)
            return;
        }

        // loop skills if found
        data.skills.forEach((skill) => {
            const skillCard = document.createElement("div");
            skillCard.className = "skillCard";
            const skillName = document.createElement("div");
            skillName.className = "skillName";
            skillName.textContent = skill.skill_name;
            const description = document.createElement("div");
            description.className = "description";
            description.textContent = skill.description
            const wrapper = document.createElement("div");
            wrapper.className = "wrapper";
            const rating = document.createElement("button");
            rating.className = "rating";
            for (let i = 0; i < 5; i++) {
                const star = document.createElement("i");
                star.className = "fa fa-star";
                if (i <= skill.rating - 1) {
                    star.style.color = "orange";
                }
                else {
                    star.style.color = "grey";
                }
                rating.appendChild(star);
            }
            const availability = document.createElement("button");
            availability.className = "availability";
            if (skill.availability == "both") {
                availability.textContent = "Online - Offline";
            }
            else {
                availability.textContent = `${skill.availability}`;
            }
            const price = document.createElement("button");
            price.className = "price";
            if (skill.price == 0) {
                price.textContent = "₦Free";
            }
            else {
                price.textContent = `₦${skill.price}`;
            }
            wrapper.append(rating, availability, price);
            skillCard.append(skillName, description, wrapper);
            skillsContainer.appendChild(skillCard);
        });
    }
    catch (error) {
        console.error("Fetch skills error:", error);
    }
}

// get tutor info
async function getUserData() {
    const url = `https://peerlynx-server.onrender.com/user-data?email=${encodeURIComponent(recipientEmail)}`;
    // const url = `http://10.0.2.2:3000/user-data?email=${encodeURIComponent(recipientEmail)}`;

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
        const time = new Date(user.created_at).toLocaleDateString([], {
            year: "numeric", month: "short", day: "numeric" 
        });
        
        recipientSchool.textContent = user.university;
        joinedEl.textContent = `Joined PeerLynx on ${time}`;

        if (user.mobile) {
            recipientMobileEl.href = `tel://${user.mobile}`;
            recipientMobileEl.style.display = "block";
        }
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

(async()=>{
    await getTutorSkills();
    await getUserData();
})();
