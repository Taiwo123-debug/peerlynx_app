
import { initSQLiteDB, saveLocalMessage, getChatList } from "./sqlite-init.js";

// SESSION
const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// HOME BUTTON
const homeBtn = document.querySelector(".homeBtn");

homeBtn.href = userType === "student" ? "student-home.html" : "tutor-home.html";

// DOM
const chatContainer = document.querySelector(".chatContainer");

// SOCKET
const socket = io("https://peerlynx-server.onrender.com", {
    transports: ["websocket", "polling"]
});

// INIT
window.addEventListener("DOMContentLoaded", async () => {
    await initSQLiteDB();
    await refreshChats();
});

// SOCKET CONNECT
socket.on("connect", () => {
    socket.emit("register", userEmail);
});

// REAL-TIME MESSAGE HANDLER
socket.on("new_message", async (msg) => {
    try {
        // Save to local DB 
        await saveLocalMessage({
            ...msg,
            sync_status: "synced"
        });

        // mark unread messages
        const currentOpen = sessionStorage.getItem("openChat");
        const conversationUser = msg.sender_id === userEmail ? msg.receiver_id : msg.sender_id;

        // ONLY mark unread if NOT currently open chat
        if (currentOpen !== conversationUser) {
            const unreadMap = getUnreadMap();
            unreadMap[conversationUser] = true;
            setUnreadMap(unreadMap);
        }

        // 2. Refresh chat list (force latest state)
        await refreshChats();
    }
    catch (err) {
        console.error("Socket save error:", err);
    }
});

// LOAD CHAT LIST
async function refreshChats() {
    try {
        const chats = await getChatList(userEmail);
        renderChats(chats);
    }
    catch (error) {
        console.log("Chat load error:", error);
    }
}

// RENDER CHATS
function renderChats(chats) {
    chatContainer.innerHTML = "";

    if (!chats || chats.length === 0) {
        chatContainer.innerHTML = ` <div class="emptyChat">No chats yet</div>`;
        return;
    }

    chats.forEach(chat => {
        const chatEl = document.createElement("div");
        chatEl.className = "chats";

        // TIME
        const time = chat.last_time
            ? new Date(chat.last_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
            : "";

        const imgSrc = `https://peerlynx-server.onrender.com${chat.profile_picture}`

        const unreadMap = getUnreadMap();
        const hasUnread = unreadMap[chat.other_user] === true;

        chatEl.innerHTML = `
            <div class="imageContainer">
                <div class="imageWrapper">
                    <img src="${imgSrc}" class="imageEl" onerror="src='./assets/images/no-image.png'">
                </div>
            </div>

            <div class="textContainer">
                <span class="usernameEl">
                    ${chat.first_name} ${chat.last_name}
                </span>

                <span class="msgEl">
                    ${chat.last_message || ""}
                </span>
            </div>

            <div class="timeContainer">
                <span class="timeEl">${time}</span>
            </div>

             <div class="dotContainer">
                <span class="unreadDot ${hasUnread ? "active" : ""}"data-chat="${chat.other_user}"></span>
            </div>
        `;

        // OPEN CHAT
        chatEl.addEventListener("click", () => {

             // clear unread state
            const unreadMap = getUnreadMap();
            delete unreadMap[chat.other_user];
            setUnreadMap(unreadMap);

            // remove dot instantly
            const dot = chatEl.querySelector(".unreadDot");
            if (dot) dot.classList.remove("active");

            // set current open chat
            sessionStorage.setItem("openChat", chat.other_user);

            const url = `messenger.html?recipient-email=${encodeURIComponent(chat.other_user)}&recipient-name=${encodeURIComponent(chat.first_name + " " + chat.last_name)}&recipient-image=${encodeURIComponent(imgSrc)}`;
            window.location.href = url;
        });

        chatContainer.appendChild(chatEl);
    });
}

function getUnreadMap() {
    return JSON.parse(localStorage.getItem("unreadMap") || "{}");
}

function setUnreadMap(map) {
    localStorage.setItem("unreadMap", JSON.stringify(map));
}