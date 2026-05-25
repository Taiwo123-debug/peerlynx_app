const userType = sessionStorage.getItem("userType");
const homeBtn = document.querySelector(".homeBtn");
homeBtn.href = `${userType}-home.html`;


