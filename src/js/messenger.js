import {
    initSQLiteDB,
    saveLocalMessage,
    getMessages,
    addPendingSync,
    getPendingSync,
    removePendingSync,
    updateLocalMessageId
} from "./sqlite-init.js";

// SESSION
const session = sessionStorage.getItem("loginTrue");
const userEmail = sessionStorage.getItem("email");
const userType = sessionStorage.getItem("userType");

if (!session || !userEmail) {
    window.location.href = "login.html";
    throw new Error("No session found");
}

// read chat

// RECIPIENT
const params = new URLSearchParams(window.location.search);

const recipientEmail = decodeURIComponent(params.get("recipient-email"));
const recipientName = decodeURIComponent(params.get("recipient-name"));
const recipientImage = decodeURIComponent(params.get("recipient-image"));

const recipientImageEl = document.querySelector(".recipientImageEl");
const recipientNameEl = document.querySelector(".recipientNameEl");
const recipientUserTypeEl = document.querySelector(".recipientUserTypeEl");

recipientNameEl.textContent = recipientName;
recipientUserTypeEl.textContent = userType === "tutor" ? "student" : "tutor";
recipientImageEl.src = recipientImage || "./assets/images/no-image.png";

// DOM
const profileContainer = document.querySelector(".profileContainer");
const windowHistory = document.querySelector(".windowHistory");
const chatBoard = document.querySelector(".chatBoard");
const sendMessageBtn = document.querySelector(".sendMessageBtn");
const inputEl = document.querySelector(".inputEl");

// SQLITE INIT
window.addEventListener("DOMContentLoaded", async () => {
    await initSQLiteDB();
    if (chatBoard) {
        chatBoard.scrollTop = chatBoard.scrollHeight;
    }
});

// OPEN PROFILE
profileContainer.addEventListener("click", () => {
    if (userType === "student") {
        window.location.href = `tutor-preview.html?recipient-email=${encodeURIComponent(recipientEmail)}&recipient-name=${encodeURIComponent(recipientName)}&recipient-image=${encodeURIComponent(recipientImage)}`;
    }
    else {
        window.location.href = `student-preview.html?recipient-email=${encodeURIComponent(recipientEmail)}&recipient-name=${encodeURIComponent(recipientName)}&recipient-image=${encodeURIComponent(recipientImage)}`;
    }
});

windowHistory.addEventListener("click", () => {
    window.history.back();
});

// SOCKET
const socket = io("https://peerlynx-server.onrender.com", {
    transports: ["websocket", "polling"]
});

socket.on("connect", async () => {
    socket.emit("register", userEmail);
    await syncPendingMessages();
    await loadChat();
});

// CHAT
const conversationId = [userEmail, recipientEmail].filter(Boolean).sort().join("_");

let lastRenderedDate = null;
// Track temporary IDs
const pendingTempIds = new Map();

inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessageBtn.click();
    }
});

sendMessageBtn.addEventListener("click", () => {
    const text = inputEl.value.trim();
    if (!text) return;
    sendMessage(text);
});

// SEND MESSAGE
async function sendMessage(text) {
    inputEl.value = "";
    const tempId = `temp_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const msg = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: userEmail,
        receiver_id: recipientEmail,
        message: text,
        created_at: createdAt
    };

    // track temporary outgoing
    pendingTempIds.set(tempId, {
        text,
        created_at: createdAt
    });

    appendMessage(msg);
    await saveLocalMessage(msg);

    try {
        const response = await fetch("https://peerlynx-server.onrender.com/chat/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(msg)
            }
        );

        const result = await response.json();

        if (result.success && result.message?.id) {
            const serverId = result.message.id;

            // update local sqlite
            await updateLocalMessageId(tempId, serverId);

            // update DOM
            const bubble = document.querySelector(`[data-msg-id="${tempId}"]`);

            if (bubble) {
                bubble.setAttribute("data-msg-id", serverId);
            }

            // remove tracking
            pendingTempIds.delete(tempId);
        }
    }
    catch (err) {
        console.log("offline message saved");
        await addPendingSync("message", msg);
    }
}

// RECEIVE MESSAGE
socket.on("new_message", async (msg) => {
    if (msg.conversation_id !== conversationId) {
        return;
    }

    // already exists
    const exists = document.querySelector(`[data-msg-id="${msg.id}"]`);

    if (exists) {
        return;
    }

    // detect same outgoing message
    if (msg.sender_id === userEmail) {
        const pendingEntries = [...pendingTempIds.entries()];
        for (const [tempId, tempData] of pendingEntries) {
            const sameText = tempData.text === msg.message;
            if (sameText) {
                // update DOM temp bubble
                const tempBubble = document.querySelector(`[data-msg-id="${tempId}"]`);

                if (tempBubble) {
                    tempBubble.setAttribute("data-msg-id", msg.id);
                }

                // update sqlite
                await updateLocalMessageId(tempId, msg.id);

                pendingTempIds.delete(tempId);
                return;
            }
        }
    }

    appendMessage(msg);
    await saveLocalMessage({
        ...msg,
        sync_status: "synced"
    });
});

// LOAD CHAT
async function loadChat() {
    const localMessages = await getMessages(conversationId);
    renderMessages(localMessages);
    await syncWithServer(localMessages);
}

// SYNC SERVER
async function syncWithServer(localMessages) {
    try {
        const response = await fetch(`https://peerlynx-server.onrender.com/chat/${conversationId}`);

        const serverMessages = await response.json();

        if (!Array.isArray(serverMessages)) {
            return;
        }

        const localIds = new Set(localMessages.map(m => m.id));

        const sorted =serverMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        for (const msg of sorted) {
            if (!localIds.has(msg.id)) {
                appendMessage(msg);
                await saveLocalMessage({
                    ...msg,
                    sync_status: "synced"
                });
            }
        }
    }
    catch (err) {
        console.log("offline mode");
    }
}

// APPEND MESSAGE
function appendMessage(msg) {
    // hard duplicate protection
    if (document.querySelector(`[data-msg-id="${msg.id}"]`)) {
        return;
    }

    const messageDate = formatChatDate(msg.created_at);

    if (messageDate !== lastRenderedDate) {
        renderDateHeader(messageDate);
        lastRenderedDate = messageDate;
    }

    const wrapper1 = document.createElement("div");
    wrapper1.setAttribute("data-msg-id", msg.id);
    const wrapper2 = document.createElement("div");
    const wrapper3 = document.createElement("span");
    const wrapper4 = document.createElement("span");

    const isSender = msg.sender_id === userEmail;

    if (isSender) {
        wrapper1.className = "sentMessagesWrapper";
        wrapper2.className = "sentMessages";
        wrapper3.className = "sent";
        wrapper4.className = "sentTime";
    }
    else {
        wrapper1.className = "recievedMessagesWrapper";
        wrapper2.className = "recievedMessages";
        wrapper3.className = "recieved";
        wrapper4.className = "recievedTime";
    }

    wrapper3.textContent = msg.message;
    wrapper4.textContent = new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    wrapper2.append(wrapper3, wrapper4);
    wrapper1.appendChild(wrapper2);
    chatBoard.appendChild(wrapper1);
    chatBoard.scrollTop = chatBoard.scrollHeight;
}

// RENDER MESSAGES
function renderMessages(messages) {
    chatBoard.innerHTML = "";
    lastRenderedDate = null;
    messages.forEach(msg => {
        appendMessage(msg);
    });
}

// SYNC PENDING
async function syncPendingMessages() {
    const pending = await getPendingSync();
    for (const item of pending) {
        try {
            await fetch("https://peerlynx-server.onrender.com/chat/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: item.payload
                }
            );

            await removePendingSync(item.id);
        }
        catch (err) {
            console.log("still offline");
        }
    }
}

// DATE FORMAT
function formatChatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// DATE HEADER
function renderDateHeader(label) {
    const header = document.createElement("div");
    header.className = "chatDateHeader";
    header.textContent = label;
    chatBoard.appendChild(header);
}

window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("openChat");
});