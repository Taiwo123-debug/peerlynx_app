const session = sessionStorage.getItem("loginTrue");
const studentEmail = sessionStorage.getItem("email");

if (!session || !studentEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

const tutorImage = document.querySelector(".tutorImage");
const tutorNameEl = document.querySelector(".tutorName");
const skillNameEl = document.querySelector(".skillName");
const tutorEmailEl = document.querySelector(".tutorEmail");
const alumni = document.querySelector(".alumni");
const ongoing = document.querySelector(".ongoing");
const rates = document.querySelector(".rates");
const availability = document.querySelector(".availability");
const description = document.querySelector(".description");

const params = new URLSearchParams(window.location.search);
const tutorEmail = decodeURIComponent(params.get("email"));
const skillName = decodeURIComponent(params.get("skill"));

const back = document.querySelector(".back");

const chatBtn = document.querySelector(".chatBtn");

const container = document.querySelector(".container");
const loadingContainer = document.querySelector(".loadingContainer");

back.addEventListener("click", ()=>{
    window.history.back();
})

window.addEventListener("DOMContentLoaded", async () => {
    loadingContainer.style.display = "flex";
    await getSkillPreview();
    await getOgoingAlumniCount();
});

// get tutor and skill profile
async function getSkillPreview() {
    const url = `https://peerlynx-server.onrender.com/skill-preview?email=${encodeURIComponent(tutorEmail)}&skill_name=${encodeURIComponent(skillName)}`;
    //   const url = `http://10.0.2.2:3000/skill-preview?email=${encodeURIComponent(tutorEmail)}&skill_name=${encodeURIComponent(skillName)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            console.log(data.message);
            return;
        }

        tutorImage.src = data.profile_picture ? `https://peerlynx-server.onrender.com${data.profile_picture}` : "./assets/images/no-image.png";
        // tutorImage.src = data.profile_picture ? `http://10.0.2.2:3000${data.profile_picture}` : "./assets/images/no-image.png";
        tutorNameEl.textContent = data.skill.tutor_name;
        skillNameEl.textContent = data.skill.skill_name;
        tutorEmailEl.textContent = tutorEmail;
        alumni.textContent = data.skill.finished;
        ongoing.textContent = data.skill.ongoing;
        if (data.skill.price == 0) {
            rates.textContent = "Free";
        }
        else {
            rates.textContent = data.skill.price;
        }
        availability.textContent = data.skill.availability;
        description.textContent = data.skill.description;
    }
    catch (error) {
        alert(error)
        console.error(error);
    }
}

// get ongoing students and alumni count
// get ongoing students count
async function getOgoingAlumniCount() {
    const url = `https://peerlynx-server.onrender.com/active-alumni-count?email=${encodeURIComponent(tutorEmail)}`;
    // const url = `http://10.0.2.2:3000/active-alumni-count?email=${encodeURIComponent(tutorEmail)}`;
    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            alumni.textContent = 0;
            ongoing.textContent = 0;
            return;
        }

        alumni.textContent = data.ongoing || 0;
        ongoing.textContent = data.finished || 0;
        container.style.display = "block";
        loadingContainer.style.display = "none";
    }
    catch (err) {
        loadingContainer.style.display = "none";
        console.error("Failed to load count:", err);
    }
}

// go to messenger
chatBtn.addEventListener("click", ()=>{
    window.location.href = `messenger.html?recipient-email=${encodeURIComponent(tutorEmail)}&recipient-name=${encodeURIComponent(tutorNameEl.textContent)}&recipient-image=${encodeURIComponent(tutorImage.src)}`;
})