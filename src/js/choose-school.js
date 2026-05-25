const email = sessionStorage.getItem("email"); 
const userType = sessionStorage.getItem("userType"); 
const university = document.querySelectorAll(".university");
const schoolName = document.querySelectorAll(".schoolName");
const userTypeMessage = document.querySelector(".userTypeMessage");
const continueSignUp = document.querySelector(".continueSignUp");

if (!email || !userType) {
    window.location.href = "sign-up.html";
}

let schoolChosen = null;
university.forEach((item, index)=>{
    item.addEventListener("click", ()=>{
        university.forEach((el) => {
            el.style.backgroundColor = "transparent";
        });
        item.style.backgroundColor = "#a370f7";
        schoolChosen = schoolName[index].textContent;
    })
})

continueSignUp.addEventListener("click", async()=>{
    if (!schoolChosen) {
        showUniversityWarning("Choose a university");
        return;
    }

    const url = "https://peerlynx-server.onrender.com/set-university";
    // const url = "http://10.0.2.2:3000/set-university";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                university: schoolChosen,
                email: email
            })
        });
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem("loginTrue", data.loginTrue);
            sessionStorage.setItem("university", schoolChosen);
            if (userType == "student") {
                window.location.href = "student-home.html";
            }
            else {
                window.location.href = "tutor-home.html";
            }
        }
        else {
            showUniversityWarning(data.message);
        }
    }
    catch (err) {
        showUniversityWarning(err);
        console.error("Error saving university", err);
    }
})

function showUniversityWarning(msg) {
    let x = 0;
    const interval = setInterval(() => {
        x += 0.1;
        userTypeMessage.style.opacity = x;
        userTypeMessage.textContent = msg;
        if (x >= 1) {
            clearInterval(interval); x = 1;
            setTimeout(() => {
                userTypeMessage.textContent = "";
                userTypeMessage.style.opacity = 0;
            }, 3000);
        }
    }, 40);
}