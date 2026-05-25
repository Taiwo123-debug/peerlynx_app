const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const skillName = document.querySelector(".skillName");
const noSkill = document.querySelector(".noSkill");
const skillsContainer = document.querySelector(".skillsContainer");
const noSkillMessage = document.querySelector(".noSkillMessage");
const categoryBtn = document.querySelector(".categoryBtn");
const windowHistory = document.querySelector(".back");

windowHistory.addEventListener("click", ()=>{
    window.history.back();
})

const params = new URLSearchParams(window.location.search);

const category = decodeURIComponent(params.get("skill"));
const topic = decodeURIComponent(params.get("topic"));

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// functions initiator
(async()=>{
    if (category) {
        skillName.textContent = category;
        await getSkillsByCategory(category);
        noSkillMessage.textContent = "Sorry, there are no skills in this category";
    }
    else if (topic) {
        skillName.textContent = topic;
        await getSkillsByTopic(topic);
        noSkillMessage.textContent = "Sorry, there are no skills of this topic";
    }
    else {
        skillName.textContent = "Search skill";
    }
})();

// get skills by category
async function getSkillsByCategory() {
    const url = `https://peerlynx-server.onrender.com/category-skills?category=${encodeURIComponent(category)}`;
    // const url = `http://10.0.2.2:3000/category-skills?category=${encodeURIComponent(category)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const skillsContainer = document.querySelector(".skillsContainer");
        skillsContainer.innerHTML = "";
        if (!data.success) {
            noSkill.style.display = "flex";
            return;
        }

        data.skills.forEach((skill) => {
            loadDom(skill);
        });
    }
    catch (error) {
        alert(error)
        console.error("Failed to fetch skills");
    }
}

// get skills by category
async function getSkillsByTopic() {
    const url = `https://peerlynx-server.onrender.com/topic-skills?topic=${encodeURIComponent(topic)}`;
    // const url = `http://10.0.2.2:3000/topic-skills?topic=${encodeURIComponent(topic)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        skillsContainer.innerHTML = "";
        if (!data.success) {
            noSkill.style.display = "flex";
            return;
        }

        data.skills.forEach((skill) => {
            loadDom(skill);
        });
    }
    catch (error) {
        alert(error)
        console.error("Failed to fetch skills");
    }
}
// helper function load dom elements
function loadDom(skill){
    const skillCard = document.createElement("div");
    const tutorName = document.createElement("span");
    tutorName.className = "tutorName";
    tutorName.textContent = `Tutor- ${skill.tutor_name}`;
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
    rating.className = "highestRating";
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
    price.textContent = `₦${skill.price}`;
    wrapper.append(rating, availability, price);
    skillCard.append(skillName, description, wrapper, tutorName);
    skillsContainer.appendChild(skillCard);

    const loadedSkills = document.querySelectorAll(".skillCard");
    loadedSkills.forEach((item, index)=>{
        item.addEventListener("click", ()=>{
            window.location.href = `skill-preview.html?email=${encodeURIComponent(skill.tutor_email)}&skill=${encodeURIComponent(skill.skill_name)}`;
        })
    })
}
