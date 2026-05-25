const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const findTutorBtn = document.querySelector(".findTutorBtn");
const topicInput = document.querySelector(".topicInput");
const recommendationsWrapper = document.querySelector(".recommendationsWrapper");


if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

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
        const username = document.querySelector(".username");
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        username.textContent = fullName || "No name";
        sessionStorage.setItem("username", fullName);
        sessionStorage.setItem("user-type", "student");
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

// find tutor by topic
topicInput.addEventListener("input", (e)=>{
    let value = e.target.value;
    value = value.replace(/[<>`"'\\;]/g, "");
    value = value.slice(0, 80);
    e.target.value = value;
})

findTutorBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    let topic = topicInput.value.trim();
    if (topic) {
        topicInput.value = "";
        window.location.href = `view-skills.html?topic=${topic}`;
    }
})

async function topSkillsRoutine() {
    const queryLimit = 4;
    const url = `https://peerlynx-server.onrender.com/top-tutor-skills?limit=${queryLimit}`;
    // const url = `http://10.0.2.2:3000/top-tutor-skills?limit=${queryLimit}`;
    try {
        const response = await fetch(url, {
            method: "GET"
        });

        const data = await response.json();
        if (!data.success) {
            alert(data.message);
            return;
        }

        let aiRecommendation = data.skills;
        await renderSkills(data.skills);
    }
    catch (err) {
        console.error("Failed to ai recommendations one:", err);
    }
}

// get student skill data for recommendation
// data 
let studentSkills = []; 
async function getStudentSkill() {
    const url = `https://peerlynx-server.onrender.com/student-skills-selected?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/student-skills-selected?email=${encodeURIComponent(email)}`;

    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            // call routine 1
            await topSkillsRoutine();
            return;
        }

        const user = data.data;
        studentSkills = data.data;
        // call routine 2
        await topSkillsRoutine();
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

// show all recommended skill
function renderSkills(skills) {
    const wrapper = document.querySelector(".recommendationsWrapper");
    wrapper.innerHTML = "";
    skills.forEach((skill) => {
        let price;
        if (skill.price == 0) {
            price = "Free";
        }
        else {
            price = `${skill.price}`;
        }
        const card = document.createElement("div");
        card.className = "recommendations";
        card.innerHTML = `
            <div class="imageWrapper">
                <img src="https://peerlynx-server.onrender.com${skill.profile_picture}" onerror="src='./assets/images/no-image.png'"/>
            </div>

            <div class="skillsWrapper">
                <span class="skill">${skill.skill_name || "Unknown Skill"}</span>
                <span class="tutorName">${skill.tutor_name || "Unknown Tutor"}</span>
                <span class="price">₦${price}</span>
            </div>

            <div class="durationAndStars">
                <div class="top">
                    <span class="availability">
                        ${skill.availability || "Flexible"}
                    </span>
                </div>
                <div class="stars">
                    ${skill.rating || 0}
                    <i class="fa fa-star"></i>
                </div>
            </div>
        `;

        // click event (optional)
        card.addEventListener("click", () => {
            window.location.href = `skill-preview.html?email=${encodeURIComponent(skill.tutor_email)}&skill=${encodeURIComponent(skill.skill_name)}`;
        });
        wrapper.appendChild(card);
    });
}

(async()=>{
    await getUserData();
    await getStudentSkill();
})();
