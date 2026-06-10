const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

document.querySelector(".homeBtn").href = "student-home.html";
const recommendationsWrapper = document.querySelector(".recommendationsWrapper");

// get 12 skills with high star
async function topSkillsRoutine() {
    const queryLimit = 12;
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
        await renderSkills(data.skills);
    }
    catch (err) {
        console.error("Failed to all recommendations one:", err);
    }
}

// render skills
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
                <img 
                    src="${skill.profile_picture ? `https://peerlynx-server.onrender.com${skill.profile_picture}` : './assets/images/no-image.png'}"
                    onerror="this.onerror=null;this.src='./assets/images/no-image.png';"
                />
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
    await topSkillsRoutine();
})();