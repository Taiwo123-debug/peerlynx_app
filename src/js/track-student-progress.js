const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

const params = new URLSearchParams(window.location.search);

const recipientEmail = decodeURIComponent(params.get("recipient-email"));
const recipientName = decodeURIComponent(params.get("recipient-name"));
const skillName = decodeURIComponent(params.get("skill-name"));

const skillStatus = sessionStorage.getItem("skillStatus");

if (!recipientEmail || !skillName) {
    alert("Missing session parameters");
    window.history.back();
}

// DOM
const sessionContainer = document.querySelector(".sessionContainer");
const createSessionBtn = document.querySelector(".createSessionBtn");

// course status dom
const courseStatusWrapper = document.querySelector(".courseStatusWrapper");
const courseStatus = document.querySelector(".courseStatus");
const changeStatusBtn = document.querySelector(".changeStatusBtn");

document.querySelector(".studentName").textContent = recipientName || "";
document.querySelector(".skilllNameEl").textContent = skillName || "";
const statusWrapper = document.querySelector(".statusWrapper");
const courseCompleted = document.querySelector(".courseCompleted");
const closeCourseCompleted = document.querySelector(".closeCourseCompleted");
const badgeBtn = document.querySelector(".badgeBtn");
courseStatus.textContent = skillStatus;

// back button
document.querySelector(".windowHistory").addEventListener("click", () => window.history.back());

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

    createSessionBtn.disabled = false;
    createSessionBtn.style.opacity = 1;
    statusWrapper.style.display = "grid";
}

// get session on load
async function getTrackingData() {
     const url =
        `https://peerlynx-server.onrender.com/student-tracking?` +
        `tutor_email=${encodeURIComponent(userEmail)}&` +
        `student_email=${encodeURIComponent(recipientEmail)}&` +
        `skill_name=${encodeURIComponent(skillName)}`;
    // const url =
    //     `http://10.0.2.2:3000/student-tracking?` +
    //     `tutor_email=${encodeURIComponent(userEmail)}&` +
    //     `student_email=${encodeURIComponent(recipientEmail)}&` +
    //     `skill_name=${encodeURIComponent(skillName)}`;

    try {

        const res = await fetch(url);
        const data = await res.json();

        sessionContainer.innerHTML = "";

        if (!data.success || !data.student_session.length) {
            createSessionBtn.disabled = false;
            createSessionBtn.style.opacity = 1;
            return;
        }
        data.student_session.forEach(renderSession);
        updateStudentTracking();
    }
    catch (err) {
        console.error(err);
        alert("Failed to load sessions");
    }
}

// create new session
createSessionBtn.addEventListener("click", async () => {
    const sessionCards = document.querySelectorAll(".sessionCard");
    const nextSessionNumber = sessionCards.length + 1;

    const payload = {
        session_number: nextSessionNumber,
        student_attended: 0,
        tutor_present: 0,
        session_completed: 0
    };

    try {
        // save to db
        const saved = await sendTrackingData(
            userEmail,
            recipientName,
            recipientEmail,
            skillName,
            nextSessionNumber,
            0,
            0,
            0
        );

        if (!saved) {
            alert("Failed to save session");
            return;
        }

        renderSession(payload);
        updateStudentTracking();
    }
    catch (err) {
        console.error(err);
        alert("Error creating session");
    }
});

/* =========================
   SEND TO SERVER
========================= */

async function sendTrackingData(tutorEmail, studentName, studentEmail, skillName, sessionNumber, studentAttended, tutorPresent, sessionCompleted) {
    const url = "https://peerlynx-server.onrender.com/student-tracking";
    // const url = "http://10.0.2.2:3000/student-tracking";

    const trackingObject = {
        tutor_email: tutorEmail,
        student_name: studentName,
        student_email: studentEmail,
        skill_name: skillName,
        session_number: sessionNumber,
        student_attended: studentAttended,
        tutor_present: tutorPresent,
        session_completed: sessionCompleted
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tracking: trackingObject })
        });
        const data = await response.json();
        return data.success;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}

// update tracking handlers
function updateStudentTracking() {
    // student attended
    document.querySelectorAll(".studentAttendedCheckbox").forEach((btn, index) => {
        btn.onclick = () => {
            let checked = Number(btn.dataset.checked);
            if (checked === 0) {
                checked = 1;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "#a370f7";
                updateTrackingServer(index + 1, "student_attended", checked);
            }
            else {
                checked = 0;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "transparent";
                updateTrackingServer(index + 1, "student_attended", checked);
            }
        };
    });

    // tutor present
    document.querySelectorAll(".tutorPresentCheckbox").forEach((btn, index) => {
        btn.onclick = () => {
            let checked = Number(btn.dataset.checked);
            if (checked === 0) {
                checked = 1;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "#a370f7";
                updateTrackingServer(index + 1, "tutor_present", checked);
            }
            else {
                checked = 0;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "transparent";
                updateTrackingServer(index + 1, "tutor_present", checked);
            }
        };
    });

    // session completed
    document.querySelectorAll(".sessionCompletedCheckbox").forEach((btn, index) => {
        btn.onclick = () => {
            let checked = Number(btn.dataset.checked);
            if (checked === 0) {
                checked = 1;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "#a370f7";
                updateTrackingServer(index + 1, "session_completed", checked);
            }
            else {
                checked = 0;
                btn.dataset.checked = checked;
                btn.style.backgroundColor = "transparent";
                updateTrackingServer(index + 1, "session_completed", checked);
            }
        };
    });
}

// update tracker server function
async function updateTrackingServer(sessionNumber, field, checked) {

    const url = "https://peerlynx-server.onrender.com/update-tracking";
    // const url = "http://10.0.2.2:3000/update-tracking";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                tutor_email: userEmail,
                student_email: recipientEmail,
                skill_name: skillName,
                session_number: sessionNumber,
                field: field,
                value: checked
            })
        });
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }
    }
    catch (error) {
        alert(error)    
    }
}

// change skill status
if (skillStatus == "ongoing") {
    changeStatusBtn.textContent = "Complete this course";
}
else {
    changeStatusBtn.textContent = "This course is completed";
    changeStatusBtn.style.marginTop = "150px";
    sessionContainer.style.display = "none";
    createSessionBtn.style.display = "none";
}
changeStatusBtn.addEventListener("click", ()=>{
    if (skillStatus == "finished") {
        courseCompleted.style.display = "grid";
    }
    else {
        let status = "finished";
        updateCourseStatus(status);
    }
})

// close badge container
closeCourseCompleted.addEventListener("click", ()=>{
    courseCompleted.style.display = "none";
})

// give badge
badgeBtn.addEventListener("click", async()=>{
    const url = "https://peerlynx-server.onrender.com/update-student-skill-badge";
    // const url = "http://10.0.2.2:3000/update-student-skill-badge";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                badge: "1",
                tutor_email: userEmail,
                student_email: recipientEmail,
                skill_name: skillName,
            })
        });
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }
        courseCompleted.style.display = "none";
    }
    catch (error) {
        alert(error);
    }
})

// update course status
async function updateCourseStatus(status) {
    const url = "https://peerlynx-server.onrender.com/update-student-skill-status";
    // const url = "http://10.0.2.2:3000/update-student-skill-status";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: status,
                tutor_email: userEmail,
                student_email: recipientEmail,
                skill_name: skillName,
            })
        });
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        sessionStorage.setItem("skillStatus", status);
        changeStatusBtn.textContent = "This course is completed";
        courseCompleted.style.display = "flex";
    }
    catch (error) {
        alert(error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    getTrackingData();
});

