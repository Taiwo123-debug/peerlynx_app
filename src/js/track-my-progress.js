const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

const skillsContainer = document.querySelector(".skillsContainer");
const noSkill = document.querySelector(".noSkill");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// get student skills
async function getStudentSkill() {
    const url = `https://peerlynx-server.onrender.com/student-skills-all?email=${encodeURIComponent(userEmail)}`;
    // const url = `http://10.0.2.2:3000/student-skills-all?email=${encodeURIComponent(userEmail)}`;

    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            noSkill.textContent = "You have no course to track";
            return;
        }

        data.skills.forEach((skill) => {
            const skillCard = document.createElement("div");
            skillCard.className = "skillCard";
            const skillName = document.createElement("div");
            skillName.className = "skillName";
            skillName.textContent = skill.skill_name;
            const tutorName = document.createElement("div");
            tutorName.className = "tutorName";
            tutorName.textContent = `Tutor: ${skill.tutor_name}`;
            const wrapper = document.createElement("div");
            wrapper.className = "wrapper";
            const skillStatusText = document.createElement("span");
            skillStatusText.className = "skillStatusText";
            skillStatusText.textContent = "status: ";
            const skillStatus = document.createElement("span");
            skillStatus.className = "skillStatus";
            if (skill.status == "ongoing") {
                skillStatus.style.color = "limegreen";
            }
            else if (skill.status == "finished") {
                skillStatus.style.color = "orange";
            }
            skillStatus.textContent = skill.status;
            const trackProgress = document.createElement("button");
            trackProgress.textContent = "Track progress";
            wrapper.append(skillStatusText, skillStatus, trackProgress);
            skillCard.append(skillName, tutorName, wrapper);
            skillsContainer.appendChild(skillCard);

            trackProgress.addEventListener("click", ()=>{

                sessionStorage.setItem("skillStatus", skill.status);

                let url = `my-progress.html?student-email=${encodeURIComponent(userEmail)}&tutor-email=${encodeURIComponent(skill.tutor_email)}&tutor-name=${encodeURIComponent(skill.tutor_name)}&skill-name=${encodeURIComponent(skill.skill_name)}`;
                window.location.href = url;
            })
        });

    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

getStudentSkill();
