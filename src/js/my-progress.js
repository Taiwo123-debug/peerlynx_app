const session = sessionStorage.getItem("loginTrue");
const userType = sessionStorage.getItem("userType");
const skillStatus = sessionStorage.getItem("skillStatus");

if (!session) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

const params = new URLSearchParams(window.location.search);

const studentEmail = decodeURIComponent(params.get("student-email"));
const tutorEmail = decodeURIComponent(params.get("tutor-email"));
const skillName = decodeURIComponent(params.get("skill-name"));
const tutorName = decodeURIComponent(params.get("tutor-name"));

const skillNameEl = document.querySelector(".skilllNameEl");
const courseStatus = document.querySelector(".courseStatus");
const tutorNameEl = document.querySelector(".tutorName");
const sessionContainer = document.querySelector(".sessionContainer");
const badgeWrapper = document.querySelector(".badgeWrapper");
const badgeText = document.querySelector(".badgeText");
const badgeImage = document.querySelector(".badgeImage");

// back
document.querySelector(".windowHistory").addEventListener("click", () => window.history.back());

skillNameEl.textContent = skillName;
if (skillStatus == "ongoing") {
    courseStatus.style.color = "limegreen";
}
else if (skillStatus == "finished") {
    courseStatus.style.color = "orange";
}
courseStatus.textContent = skillStatus;
tutorNameEl.textContent = `Tutor: ${tutorName}`;

function createTrackingWrapper(label, className, active) {
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    const btn = document.createElement("button");
    btn.className = className;

    btn.dataset.checked = active;
    
    if (Number(active) === 1) {
        btn.style.backgroundColor = "#a370f7";
    }
    else {
        btn.style.backgroundColor = "transparent";
    }

    const span = document.createElement("span");
    span.textContent = label;
    wrapper.append(btn, span);
    return wrapper;
}

function renderSession(sessionData) {
    const sessionCard = document.createElement("div");
    sessionCard.className = "sessionCard";
    const sessionNumber = document.createElement("div");
    sessionNumber.className = "sessionNumber";
    sessionNumber.textContent = `Session ${sessionData.session_number}`;

    const wrapper1 = createTrackingWrapper(
        "Student Attended",
        "studentAttendedCheckbox",
        sessionData.student_attended
    );

    const wrapper2 = createTrackingWrapper(
        "Tutor Present",
        "tutorPresentCheckbox",
        sessionData.tutor_present
    );

    const wrapper3 = createTrackingWrapper(
        "Session Completed",
        "sessionCompletedCheckbox",
        sessionData.session_completed
    );

    sessionCard.append(sessionNumber, wrapper1, wrapper2, wrapper3);
    sessionContainer.append(sessionCard);
}

// get session on load
async function getTrackingData() {
     const url =
        `https://peerlynx-server.onrender.com/student-tracking?` +
        `tutor_email=${encodeURIComponent(tutorEmail)}&` +
        `student_email=${encodeURIComponent(studentEmail)}&` +
        `skill_name=${encodeURIComponent(skillName)}`;
    // const url =
    //     `http://10.0.2.2:3000/student-tracking?` +
    //     `tutor_email=${encodeURIComponent(tutorEmail)}&` +
    //     `student_email=${encodeURIComponent(studentEmail)}&` +
    //     `skill_name=${encodeURIComponent(skillName)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        sessionContainer.innerHTML = "";

        if (!data.success || !data.student_session.length) {
            return;
        }

        data.student_session.forEach(renderSession);
        await getBadge();
    }
    catch (err) {
        console.error(err);
        alert("Failed to load sessions");
    }
}

// get badge
async function getBadge() {
       const url = "https://peerlynx-server.onrender.com/get-student-badge";
    // const url = "http://10.0.2.2:3000/get-student-badge";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tutor_email: tutorEmail,
                student_email: studentEmail,
                skill_name: skillName,
            })
        });
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        if(!data.badge) {
                badgeText.textContent = "Good job student. No badge for this course.";
        }

        if (data.badge) {
            badgeText.textContent = "Good job student. Here's your badge";
            badgeImage.src = "./assets/images/badge-removebg.png";
        }
    }
    catch (error) {
        alert(error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    getTrackingData();
});


