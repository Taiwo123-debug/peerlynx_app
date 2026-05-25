const session = sessionStorage.getItem("loginTrue");
const email = sessionStorage.getItem("email");
const userType= sessionStorage.getItem("userType");
const tutorStudentContainer = document.querySelector(".tutorStudentContainer");
const noStudent = document.querySelector(".noStudent");

if (!session || !email) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// get active students
const status = "finished";
async function getTutorStudents() {
    const url = `https://peerlynx-server.onrender.com/ongoing-finished-tutor-students?email=${encodeURIComponent(email)}&status=${encodeURIComponent(status)}`;
    // const url = `http://10.0.2.2:3000/ongoing-finished-tutor-students?email=${encodeURIComponent(email)}&status=${encodeURIComponent(status)}`;
    try {
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();

        tutorStudentContainer.innerHTML = "";

        if (!data.success || data.students.length === 0) {
            tutorStudentContainer.innerHTML = "";
            noStudent.textContent = "You have no alumni yet";
            return;
        }
        
        data.students.forEach(student => {
            const time = new Date(student.created_at).toLocaleDateString([], {
                year: "numeric", month: "short", day: "numeric" 
            });

            const imgSrc = `https://peerlynx-server.onrender.com${student.profile_picture}`;

            const studentHTML = `
                <a href="student-preview.html?recipient-email=${encodeURIComponent(student.student_email)}&recipient-name=${encodeURIComponent(student.student_name)}&recipient-image=http://10.0.2.2:3000${encodeURIComponent(student.profile_picture)}">
                    <div class="alumni">
                        <div class="imageContainer">
                            <img class="studentPicture" 
                                src="${imgSrc}" onerror="src='./assets/images/no-image.png'"
                            >
                        </div>

                        <div class="studentDetails">
                            <div class="skillName">
                                ${student.skill_name || "No Skill"}
                            </div>
                            <div class="studentName">
                                ${student.student_name || "Unknown Student"}
                            </div>
                            <div class="subscribeDate">
                                Finished: ${time}
                            </div>
                        </div>
                    </div>
                </a>
            `;

            tutorStudentContainer.innerHTML += studentHTML;
        });
    }
    catch (error) {
        console.error("Fetch tutor students error:", error);
    }
}

getTutorStudents();
