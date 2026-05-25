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
    let url = `messenger.html?recipient-email=${encodeURIComponent(recipientEmail)}&recipient-name=${encodeURIComponent(recipientName)}&recipient-image=${encodeURIComponent(recipientImage)}`;
    window.location.href = url;
})

const recipientPictureEl = document.querySelector(".recipientPicture");
const recipientNameEl = document.querySelector(".recipientName");
const recipientSchool = document.querySelector(".recipientSchool");
const recipientEmailEl = document.querySelector(".recipientEmailEl");
const recipientMobileEl = document.querySelector(".recipientMobileEl");

recipientNameEl.textContent = `${recipientName} (Student)`;
recipientPictureEl.src = recipientImage || "./assets/images/no-image.png";
recipientEmailEl.href = `mailto:${recipientEmail}`;

const skillHeader = document.querySelector(".skillHeader");
const skillsContainer = document.querySelector(".skillsContainer");
const recommendationContainer = document.querySelector(".recommendationContainer");
const recommendationHeader = document.querySelector(".recommendationHeader");
const joinedEl = document.querySelector(".joinedEl");

// get student info
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
                recipientMobileEl.href = `tel:${user.mobile}`;
                recipientMobileEl.style.display = "block";
        }
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

// get student skills
async function getStudentSkills() {
const url = `https://peerlynx-server.onrender.com/registered-student-skills?student_email=${encodeURIComponent(recipientEmail)}&tutor_email=${encodeURIComponent(userEmail)}`;
    //const url = `http://10.0.2.2:3000/registered-student-skills?student_email=${encodeURIComponent(recipientEmail)}&tutor_email=${encodeURIComponent(userEmail)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        skillsContainer.innerHTML = "";
        if (!data.success) {
            skillHeader.textContent = "This student has not subscribed to your skills yet";
            await getTutorSkills();
            return;
        }

        // loop skills if found
        await getRegisteredSkills(data, userEmail, recipientEmail);
    }
    catch (error) {
        // alert(error)
        console.error("Fetch skills error:", error);
    }
}

// helper function when student hasnt registered to a skill yet
async function getTutorSkills() {

    const url = `https://peerlynx-server.onrender.com/tutor-skills?email=${encodeURIComponent(userEmail)}`;
    // const url = `http://10.0.2.2:3000/tutor-skills?email=${encodeURIComponent(userEmail)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            skillHeader.textContent = "You have no skill to teach yet";
            return;
        }

        data.skills.forEach((skill) =>{
            const skillCard = document.createElement("div");
            skillCard.className = "skillCard";
            const skillName = document.createElement("div");
            skillName.className = "skillName";
            skillName.textContent = skill.skill_name;
            const price = document.createElement("button");
            price.className = "price";
            if (skill.price == 0) {
                price.textContent = "₦Free";
            }
            else {
                price.textContent = `₦${skill.price}`;
            }
            const registerBtn = document.createElement("button");
            registerBtn.className = "registerBtn";
            registerBtn.textContent = "Register student for this skill";
            skillCard.append(skillName, price, registerBtn);
            skillsContainer.appendChild(skillCard);

            registerBtn.addEventListener("click", async()=>{
                await registerStudent(skill.category, skill.tutor_name, skill.tutor_email, recipientName, recipientEmail, skill.skill_id, skill.skill_name, skill.description, skill.price, skill.rating);
            })
        })
    }
    catch (error) {
        alert(error);
    }
}

let registerClicked = false;
// register student to course
async function registerStudent(category, tutorName, tutorEmail, studentName, studentEmail, skillId, skillName, skillDescr, skillPrice, skillRating) {
    if (registerClicked) {
        return;
    }

    registerClicked = true;
    let status = "ongoing";
    let badge = null;

    const url = "https://peerlynx-server.onrender.com/register-student";
    // const url = "http://10.0.2.2:3000/register-student";

    let skillObject = {
        category: category,
        tutor_name: tutorName,
        tutor_email: tutorEmail,
        student_name: studentName,
        student_email: studentEmail,
        skill_id: skillId,
        skill_name: skillName,
        description: skillDescr,
        price: skillPrice,
        rating: skillRating,
        status: status,
        badge: badge
    }

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

        if (!data.success) {
            registerClicked = false;
            alert(data.message);
            return;
        }
        // await getRegisteredSkills(data, userEmail, recipientEmail);
        window.location.reload();
    }
    catch (error) {
        registerClicked = false;
        alert(error);
    }
}

// get registered skills if found
async function getRegisteredSkills(data) {
    let registeredSkills = [];
    skillHeader.textContent = "Registered skills";
    data.skills.forEach((skill) =>{
        const skillCard = document.createElement("div");
        skillCard.className = "skillCard";
        const skillName = document.createElement("div");
        skillName.className = "skillName";
        skillName.textContent = skill.skill_name;
        const description = document.createElement("div");
        description.className = "description";
        description.textContent = skill.description;
        const trackProgressBtn = document.createElement("button");
        trackProgressBtn.className = "trackProgressBtn";
        if (skill.status == "ongoing") {
            trackProgressBtn.textContent = "Track student progress";
        }
        else {
            trackProgressBtn.textContent = "Course completed";
            trackProgressBtn.style.backgroundColor = "transparent";

        }

        skillCard.append(skillName, description, trackProgressBtn);
        skillsContainer.appendChild(skillCard);

        trackProgressBtn.addEventListener("click", ()=>{
            sessionStorage.setItem("skillStatus", skill.status);
            window.location.href = `track-student-progress.html?recipient-email=${encodeURIComponent(recipientEmail)}&recipient-name=${encodeURIComponent(recipientName)}&skill-name=${encodeURIComponent(skill.skill_name)}`;
        });
        registeredSkills.push(skill.skill_name);
    })
    await recommendTutorSkills(registeredSkills);
}

async function recommendTutorSkills(registeredSkills) {
    const url = `https://peerlynx-server.onrender.com/tutor-skills?email=${encodeURIComponent(userEmail)}`;
    // const url = `http://10.0.2.2:3000/tutor-skills?email=${encodeURIComponent(userEmail)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            return;
        }

        recommendationContainer.innerHTML = "";
        recommendationHeader.textContent = "Unregistered skills";
        data.skills.forEach((skill) =>{
            // compare registered skills
            const alreadyRegistered =
                registeredSkills.some(
                    registeredSkill =>
                        registeredSkill
                            .toLowerCase()
                            .trim() ===
                        skill.skill_name
                            .toLowerCase()
                            .trim()
                );

            // skip rendering if already registered
            if (alreadyRegistered) {
                return;
            }
       
            const skillCard = document.createElement("div");
            skillCard.className = "skillCard";
            const skillName = document.createElement("div");
            skillName.className = "skillName";
            skillName.textContent = skill.skill_name;
            const price = document.createElement("button");
            price.className = "price";
            if (skill.price == 0) {
                price.textContent = "₦Free";
            }
            else {
                price.textContent = `₦${skill.price}`;
            }
            const registerBtn = document.createElement("button");
            registerBtn.className = "registerBtn";
            registerBtn.textContent = "Register student for this skill";
            skillCard.append(skillName, price, registerBtn);
            recommendationContainer.appendChild(skillCard);

            registerBtn.addEventListener("click", async()=>{
                await registerStudent(skill.category, skill.tutor_name, skill.tutor_email, recipientName, recipientEmail, skill.skill_id, skill.skill_name, skill.description, skill.price, skill.rating);
            })
        })
    }
    catch (error) {
        alert(error);
    }   
}

(async()=>{
    await getStudentSkills();
    await getUserData();
})();
