const username = sessionStorage.getItem("username");
const userType = sessionStorage.getItem("userType");
const usernameEl = document.querySelector(".username");
const userQuestionEl = document.querySelector(".userQuestion");
const categories = document.querySelectorAll(".category");
const homeBtn = document.querySelector(".homeBtn");
const categoryBtn = document.querySelector(".categoryBtn");
usernameEl.textContent = username;

if (userType == "tutor") {
    userQuestionEl.textContent = "Choose a skill to share";
    homeBtn.href = "tutor-home.html";
}
else if (userType == "student") {
    categoryBtn.style.display = "grid";
    userQuestionEl.textContent = "What skill are you looking for?";
    homeBtn.href = "student-home.html";
}

// navigate skill based on user type
categories.forEach((item, index)=>{
    item.addEventListener("click", ()=>{
        const skill = item.getAttribute("data-skill");
        if (userType == "tutor") {
            window.location.href = `new-skill.html?skill=${encodeURIComponent(skill)}`;
        }
        else {
            window.location.href = `view-skills.html?skill=${encodeURIComponent(skill)}`;
        }
    })
})

