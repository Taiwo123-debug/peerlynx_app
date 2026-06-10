import { initSQLiteDB, saveLocalMessage, getChatList } from "./sqlite-init.js";

// session
const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");
const notify = sessionStorage.getItem("notify");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// home button
const homeBtn = document.querySelector(".homeBtn");
homeBtn.href = userType === "student" ? "student-home.html" : "tutor-home.html";

// DOM
const chatContainer = document.querySelector(".chatContainer");
const loadingContainer = document.querySelector(".loadingContainer");

// socket
const socket = io("https://peerlynx-server.onrender.com", {
    transports: ["websocket", "polling"]
});

// initiate functions
window.addEventListener("DOMContentLoaded", async () => {
    loadingContainer.style.display = "flex";
    await initSQLiteDB();
    await syncMissedMessages();
    await refreshChats();
});

// notification sound
function notificationSound(type) {
    const isNotifyEnabled = notify === true || notify === "true" || notify === 1 || notify === "1";

    if (!isNotifyEnabled) return;

    const audio = new Audio(`./assets/audios/${type}.mp3`);

    audio.play().catch(err => {
        console.error("Audio play failed:", err);
    });
}

// socket connect
socket.on("connect", async() => {
    socket.emit("register", userEmail);
});

// new message
socket.on("new_message", async (msg) => {
    try {
        if (!msg?.id) return;

        notificationSound("incoming");
        
        await saveLocalMessage({
            ...msg,
            sync_status: "synced"
        });
        await refreshChats();
    }
    catch (err) {
        console.error("Socket error:", err);
    }
});

// get server messages
async function syncMissedMessages() {
    try {
        const res = await fetch(
            `https://peerlynx-server.onrender.com/chat/sync?user=${encodeURIComponent(userEmail)}`
        );

        const data = await res.json();
        if (!data.success) return;

        for (const msg of data.messages) {
            if (!msg.id) continue;
            await saveLocalMessage({
                ...msg,
                sync_status: "synced"
            });
        }
    }
    catch (err) {
        console.log("sync failed", err);
    }
}

// load chat list
async function refreshChats() {
    try {
        const chats = await getChatList(userEmail);
        renderChats(chats);
    }
    catch (error) {
        console.log("Chat load error:", error);
    }
}

// render chats
function renderChats(chats) {
    chatContainer.innerHTML = "";

    if (!chats || chats.length === 0) {
        chatContainer.innerHTML = `
            <div class="emptyChat">No chats yet</div>
        `;
        return;
    }

    chats.forEach(chat => {
        const chatEl = document.createElement("div");
        chatEl.className = "chats";

        const time = chat.last_time
            ? new Date(chat.last_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
            : "";

        // SAFE IMAGE HANDLING
        let imgSrc = "./assets/images/no-image.png";

        if (chat.profile_picture) {
            if (chat.profile_picture.startsWith("http")) {
                imgSrc = chat.profile_picture;
            }
            else {
                imgSrc = `https://peerlynx-server.onrender.com${chat.profile_picture}`;
            }
        }

        const conversationKey = chat.conversation_id;
        const hasUnread = Number(chat.unread_count) > 0;

        chatEl.innerHTML = `
            <div class="imageContainer">
                <div class="imageWrapper">
                    <img src="${imgSrc}" class="imageEl" onerror="this.src='./assets/images/no-image.png'">
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

            ${hasUnread ? `<div class="dotContainer"><div class="unreadDot active"></div></div>` : ""}
        `;

        // open messenger
        chatEl.addEventListener("click", () => {
            sessionStorage.setItem("openChat", conversationKey);

            const url = `messenger.html?recipient-email=${encodeURIComponent(chat.other_user)}&recipient-name=${encodeURIComponent(chat.first_name + " " + chat.last_name)}&recipient-image=${encodeURIComponent(imgSrc)}`;

            window.location.href = url;
        });
        chatContainer.appendChild(chatEl);
    });
    loadingContainer.style.display = "none";
}

// helper function
function getConversationId(a, b) {
    return [a, b].filter(Boolean).sort().join("_");
}
