const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const tutorName = sessionStorage.getItem("username");
const userType = sessionStorage.getItem("userType");

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}


const skillCategory = decodeURIComponent(new URLSearchParams(window.location.search).get("skill"));
const skillCategoryEl = document.querySelector(".skillCategory");
skillCategoryEl.textContent = skillCategory; 

//form validation
const newSkill = document.querySelector(".newSkill");
const description = document.querySelector(".description");
const price = document.querySelector(".price");
const availBtn = document.querySelectorAll(".availBtn");
const uploadSkillBtn = document.querySelector(".uploadSkillBtn");
const skillMessage = document.querySelector(".skillMessage");

function sanitizeText(value) {
    return value
        .replace(/[<>`\\]/g, "") // remove potentially dangerous characters
        .replace(/\s{2,}/g, " ") // collapse extra spaces
        .trimStart(); // optional
}

newSkill.addEventListener("input", (e) => {
    let value = sanitizeText(e.target.value);
    e.target.value = value.slice(0, 40);
});

description.addEventListener("input", (e) => {
    let value = sanitizeText(e.target.value);
    e.target.value = value.slice(0, 150);
});

let availibility = null;
availBtn.forEach(item => {
    item.addEventListener("click", (e)=>{
        e.preventDefault();
        availBtn.forEach((otherItem) => {
            otherItem.classList.remove("selected");
        });
        item.classList.add("selected");
        availibility = item.getAttribute("data-availability");
    })
})

//share button
uploadSkillBtn.addEventListener("click", async(e)=>{
    e.preventDefault();
    let skill = newSkill.value.trim();
    let desc = description.value.trim();
    let pri = price.value.trim();
    if (skill == "") {
        skillMessage.textContent = "Enter skill name";
    }
    else if (desc == "") {
        skillMessage.textContent = "Describe your skill";
    }
    else if (availibility == null) {
        skillMessage.textContent = "Select availability";
    }
    else {
        if (pri == "") {
            pri = 0;
        }
        await submitSkill(skill, desc, pri, availibility);
    }
})

// generate id from current time and tutor email
function generateCode() {
    const time = Date.now().toString();
    const combined = email + time;
    // generate numeric hash
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash += combined.charCodeAt(i) * (i + 1);
    }
    // convert to 8 digits max
    const code = Math.abs(hash).toString().slice(-8);
    return code;
}

// send skill to server
async function submitSkill(skill, desc, pri, availability) {
const url = "https://peerlynx-server.onrender.com/share-skill";
// const url = "http://10.0.2.2:3000/share-skill";

    let skillObject = {
        category: skillCategory,
        tutor_email: email,
        tutor_name: tutorName,
        id: generateCode(),
        skill_name: skill,
        description: desc,
        availability: availability,
        price: pri,
        rating: 3
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                skill: skillObject
            })
        });
        const data = await response.json();
        if (data.success) {
            skillMessage.textContent = data.message;
            newSkill.value = ""; 
            description.value = "";
            price.value = "";
            availBtn.forEach((item) =>{
                item.classList.remove("selected");
            })
            availability = null;
        }
        else {
            skillMessage.textContent = data.message || "Failed to share skill";
        }
    }
    catch (error) {
        alert(error)
        skillMessage.textContent = "Skill sharing error. Try again.";
    }
}