const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType= sessionStorage.getItem("userType");
const activeStudents = document.querySelector(".activeStudents");
const alumniCount = document.querySelector(".alumniCount");
const currentStudentsContainer = document.querySelector(".currentStudentsContainer");
const noStudent = document.querySelector(".noStudent");
const loadingContainer = document.querySelector(".loadingContainer");

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

async function getUserData() {
    loadingContainer.style.display = "flex";
    const url = `https://peerlynx-server.onrender.com/user-data?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/user-data?email=${encodeURIComponent(email)}`;
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
        const username = document.querySelector(".username");
        const activeStudents = document.querySelector(".activeStudents");
        const alumniCount = document.querySelector(".alumniCount");
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        username.textContent = fullName || "No name";
        activeStudents.textContent = Array.isArray(user.active_students) ? user.active_students.length : 0;
        alumniCount.textContent = Array.isArray(user.students_taught) ? user.students_taught.length : 0;
        sessionStorage.setItem("username", fullName);
        sessionStorage.setItem("userType", "tutor");
        sessionStorage.setItem("notify", user.notify);
    }
    catch (err) {
        console.error("Failed to load user:", err);
    }
}

// get ongoing students count
async function getOgoingAlumniCount() {
    const url = `https://peerlynx-server.onrender.com/active-alumni-count?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/active-alumni-count?email=${encodeURIComponent(email)}`;

    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        if (!data.success) {
            activeStudents.textContent = 0;
            alumniCount.textContent = 0;
            return;
        }

        activeStudents.textContent = data.ongoing || 0;
        alumniCount.textContent = data.finished || 0;
    }
    catch (err) {
        console.error("Failed to load count:", err);
    }
}

// get all students
async function getTutorStudents() {
    const url = `https://peerlynx-server.onrender.com/tutor-students?email=${encodeURIComponent(email)}`;
    // const url = `http://10.0.2.2:3000/tutor-students?email=${encodeURIComponent(email)}`;
    
    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        currentStudentsContainer.innerHTML = "";
        // no students
        if (!data.success || !data.students.length) {
            noStudent.textContent = "You have no students yet";
            return;
        }

        noStudent.textContent = "";
        data.students.forEach(student => {
            const studentCard = document.createElement("div");
            studentCard.className = "currentStudent";
            const studentLink = document.createElement("a");
            studentLink.href = `student-preview.html?recipient-email=${encodeURIComponent(student.student_email)}&recipient-name=${encodeURIComponent(student.student_name)}&recipient-image=https://peerlynx-server.onrender.com${encodeURIComponent(student.profile_picture)}`;
            studentLink.innerHTML = `
            <div class="studentDetails">
                    <div class="skill">
                        ${student.skill_name}
                    </div>

                    <div class="studentName">
                        ${student.student_name}
                    </div>

                    <button class="stat ${student.status}">
                        <span class="studentStatus">
                            <span class="statText">status: </span>${student.status}
                        </span>
                    </button>
                </div>
            `;
            loadingContainer.style.display = "none";
            studentCard.appendChild(studentLink);
            currentStudentsContainer.appendChild(studentCard);
        });
    }
    catch (error) {
        console.error("Fetch tutor students error:", error);
    }
}

// init
(async () => {
    await getUserData();
    await getOgoingAlumniCount();
    await getTutorStudents();
})();
