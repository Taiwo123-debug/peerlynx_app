const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const tutorName = sessionStorage.getItem("username");

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

document.querySelector(".homeBtn").href = "tutor-home.html";
const username = document.querySelector(".username");
username.textContent = tutorName;

const searchResult = document.querySelector(".searchResult");
const noSkill = document.querySelector(".noSkill");
const skillsCount = document.querySelector(".skillsCount");

// get tutor skills
async function getTutorSkills() {
    const url = `https://peerlynx-server.onrender.com/tutor-skills?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/tutor-skills?email=${encodeURIComponent(email)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const skillsContainer = document.querySelector(".skillsContainer");
        skillsContainer.innerHTML = "";
        if (!data.success) {
            noSkill.style.display = "flex";
            return;
        }

        // loop skills if found
        skillsCount.textContent = `${data.skills.length} skills shared`;
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
            const highestRating = document.createElement("button");
            highestRating.className = "highestRating";
            for (let i = 0; i < 5; i++) {
                const star = document.createElement("i");
                star.className = "fa fa-star";
                if (i <= skill.rating - 1) {
                    star.style.color = "orange";
                }
                else {
                    star.style.color = "grey";
                }
                highestRating.appendChild(star);
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
            price.textContent = `₦${skill.price}`;
            wrapper.append(highestRating, availability, price);
            skillCard.append(skillName, description, wrapper);
            skillsContainer.appendChild(skillCard);
        });
    }
    catch (error) {
        console.error("Fetch skills error:", error);
    }
}

getTutorSkills();