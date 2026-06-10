const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const findTutorBtn = document.querySelector(".findTutorBtn");
const topicInput = document.querySelector(".topicInput");
const recommendationsWrapper = document.querySelector(".recommendationsWrapper");
const loadingContainer = document.querySelector(".loadingContainer");


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
        sessionStorage.setItem("notify", user.notify);
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

// get student skill data for recommendation
async function getStudentSkill() {
    const url = `https://peerlynx-server.onrender.com/student-skills-selected?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/student-skills-selected?email=${encodeURIComponent(email)}`;
    let studentSkills = [];

    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            // call routine 1
            await topSkillsRoutine(studentSkills);
            return;
        }

        const skills = data.skills;

        skills.forEach((skill) => {
            studentSkills.push({
                skill_name: skill.skill_name,
                tutor_email: skill.tutor_email
            });
        })

        // call routine 2
        await topSkillsRoutine(studentSkills);
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

// get top skills and compare with student skills
async function topSkillsRoutine(studentSkills) {
    const queryLimit = 5;
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

        let tutorSkills = data.skills;
        await renderSkills(studentSkills, tutorSkills);
    }
    catch (err) {
        console.error("Failed to ai recommendations one:", err);
    }
}

// show all recommended skill
function renderSkills(studentSkills, tutorSkills) {
    const wrapper = document.querySelector(".recommendationsWrapper");
    wrapper.innerHTML = "";

    // 1. Extract clean, individual keywords from all the student's existing skills
    // e.g., "React Development" becomes ["react", "development"]
    const studentKeywords = studentSkills.flatMap(sk => 
        sk.skill_name.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/))
        .filter(word => word.length > 2);

    let renderedCount = 0;

    tutorSkills.forEach((tutorSkill) => {
        const isAlreadySelected = studentSkills.some(studentSkill => 
            studentSkill.skill_name === tutorSkill.skill_name && 
            studentSkill.tutor_email === tutorSkill.tutor_email
        );

        // If a match is found, skip rendering this specific tutor's skill card
        if (isAlreadySelected) {
            return; 
        }

        let price;
        if (tutorSkill.price == 0) {
            price = "Free";
        }
        else {
            price = `${tutorSkill.price}`;
        }
        const card = document.createElement("div");
        card.className = "recommendations";
        card.innerHTML = `
            <div class="imageWrapper">
                <img src="https://peerlynx-server.onrender.com${tutorSkill.profile_picture}" onerror="src='./assets/images/no-image.png'"/>
            </div>

            <div class="skillsWrapper">
                <span class="skill">${tutorSkill.skill_name || "Unknown Skill"}</span>
                <span class="tutorName">${tutorSkill.tutor_name || "Unknown Tutor"}</span>
                <span class="price">₦${price}</span>
            </div>

            <div class="durationAndStars">
                <div class="top">
                    <span class="availability">
                        ${tutorSkill.availability || "Flexible"}
                    </span>
                </div>
                <div class="stars">
                    ${tutorSkill.rating || 0}
                    <i class="fa fa-star"></i>
                </div>
            </div>
        `;

        // click event (optional)
        card.addEventListener("click", () => {
            window.location.href = `skill-preview.html?email=${encodeURIComponent(tutorSkill.tutor_email)}&skill=${encodeURIComponent(tutorSkill.skill_name)}`;
        });
        wrapper.appendChild(card);
        loadingContainer.style.display = "none";
        wrapper.style.display = "grid";   
    });
}

(async()=>{
    await getUserData();
    await getStudentSkill();
})();
