import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);

// user isolation key
const DB_KEY = sessionStorage.getItem("email");

let db = null;
let initPromise = null;

// safe initiate database
export async function initSQLiteDB() {
    if (!DB_KEY) return;
    if (db) return db;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const existing = await sqlite.isConnection("peerlynx_db", false);
            
            if (existing.result) {
                console.log("Using existing local SQLite connection reference");
                db = await sqlite.retrieveConnection("peerlynx_db", false);
            }
            else {
                try {
                    console.log("Creating new native SQLite connection...");
                    db = await sqlite.createConnection(
                        "peerlynx_db",
                        false,
                        "no-encryption",
                        1,
                        false
                    );
                }
                catch (createErr) {
                    if (createErr.message?.includes("already exists")) {
                        console.warn("Ghost connection lock detected. Evicting native handle...");
                        try {
                            await sqlite.closeConnection("peerlynx_db", false);
                            console.log("Ghost connection evicted successfully.");
                        }
                        catch (closeErr) {
                            console.log("Eviction notice bypassed or connection was not open:", closeErr.message);
                        }
                        console.log("Retrying clean native SQLite connection creation...");
                        db = await sqlite.createConnection(
                            "peerlynx_db",
                            false,
                            "no-encryption",
                            1,
                            false
                        );
                    }
                    else {
                        throw createErr;
                    }
                }
            }

            const isDbOpen = await db.isDBOpen();
            if (!isDbOpen.result) {
                await db.open();
                console.log("SQLite DB connection opened successfully.");
            }

            await createTables();
            return db;
        }
        catch (error) {
            console.error("SQLite init error:", error);
            alert(error);
            initPromise = null;
            db = null;
            throw error;
        }
    })();
    return initPromise;
}

// create tables
async function createTables() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            other_user TEXT,
            last_message TEXT,
            last_time TEXT,
            unread_count INTEGER DEFAULT 0
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT,
            sender_id TEXT,
            receiver_id TEXT,
            message TEXT,
            message_type TEXT DEFAULT 'text',
            is_read INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'pending',
            created_at TEXT
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS pending_sync (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            payload TEXT,
            created_at TEXT
        );
    `);

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_msg_conv_id ON messages(conversation_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);`);
}

// safe check if database is ready
async function checkDBReady() {
    if (!db) await initSQLiteDB();
    if (!db) throw new Error("DB not ready");
}

// save messages to local storage
export async function saveLocalMessage(msg) {
    await checkDBReady();

    if (!msg?.id) return;

    await db.run(
        `INSERT OR IGNORE INTO messages 
        (id, conversation_id, sender_id, receiver_id, message, message_type, is_read, sync_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            String(msg.id),
            msg.conversation_id,
            msg.sender_id,
            msg.receiver_id,
            msg.message,
            msg.message_type || "text",
            msg.is_read || 0,
            msg.sync_status || "synced",
            msg.created_at || new Date().toISOString()
        ]
    );

    await db.run(
        `INSERT INTO conversations 
        (id, other_user, last_message, last_time, unread_count)
        VALUES (?, ?, ?, ?, 0)
        ON CONFLICT(id) DO UPDATE SET
            last_message = excluded.last_message,
            last_time = excluded.last_time`,
        [
            msg.conversation_id,
            msg.sender_id === DB_KEY ? msg.receiver_id : msg.sender_id,
            msg.message,
            msg.created_at || new Date().toISOString()
        ]
    );
}

// get stored messages
export async function getMessages(conversation_id) {
    await checkDBReady();
    const res = await db.query(
        `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
        [conversation_id]
    );
    return res.values || [];
}

// update tempId with server id
export async function updateLocalMessageId(oldId, newId) {
    await checkDBReady();
    await db.run(
        `UPDATE messages 
         SET id = ?, sync_status = 'synced'
         WHERE id = ?`,
        [newId, oldId]
    );
}

// update conversations
export async function updateConversationPreview(data) {
    await checkDBReady();
    const existing = await db.query(
        `SELECT * FROM conversations WHERE id = ?`,
        [data.conversation_id]
    );

    if (!existing.values.length) {
        await db.run(
            `INSERT INTO conversations 
            (id, other_user, last_message, last_time, unread_count)
            VALUES (?, ?, ?, ?, 0)`,
            [data.conversation_id, data.other_user, data.last_message, new Date().toISOString()]
        );
    }
    else {
        await db.run(
            `UPDATE conversations 
             SET last_message = ?, last_time = ?
             WHERE id = ?`,
            [data.last_message, new Date().toISOString(), data.conversation_id]
        );
    }
}

// mark read messages
export async function markAsRead(conversation_id) {
    await checkDBReady();
    await db.run(
        `UPDATE messages 
         SET is_read = 1 
         WHERE conversation_id = ?`,
        [conversation_id]
    );
}

// get conversations
export async function getConversations() {
    await checkDBReady();
    const res = await db.query(
        `SELECT * FROM conversations 
         ORDER BY last_time DESC`
    );
    return res.values || [];
}

// get chat list
export async function getChatList(userEmail) {
    await checkDBReady();
    const res = await db.query(`
        SELECT 
            m.*,

            (
                SELECT COUNT(*)
                FROM messages unread
                WHERE unread.conversation_id = m.conversation_id
                AND unread.receiver_id = ?
                AND unread.is_read = 0
            ) AS unread_count

        FROM messages m

        INNER JOIN (
            SELECT conversation_id, MAX(created_at) AS latest_time
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY conversation_id
        ) latest

        ON m.conversation_id = latest.conversation_id
        AND m.created_at = latest.latest_time

        WHERE m.sender_id = ? OR m.receiver_id = ?

        ORDER BY m.created_at DESC
    `, [
        userEmail,
        userEmail,
        userEmail,
        userEmail,
        userEmail
    ]);

    const rows = res.values || [];
    const seen = new Set();

    const mappedResults = await Promise.all(rows.map(async (row) => {
        if (seen.has(row.conversation_id)) {
            return null;
        }

        seen.add(row.conversation_id);
        const isSender = row.sender_id === userEmail;

        const otherUser = isSender
            ? row.receiver_id
            : row.sender_id;

        let userData = {};

        try {
            const r = await fetch(
                `https://peerlynx-server.onrender.com/user-data?email=${encodeURIComponent(otherUser)}`
            );

            if (r.ok) {
                const data = await r.json();
                userData = data.data || data;
            }
        }
        catch (err) {
            console.log("Failed fetching user info for", otherUser, err);
        }

        return {
            conversation_id: row.conversation_id,
            last_message: row.message,
            last_time: row.created_at,
            other_user: otherUser,
            first_name: userData.first_name || "User",
            last_name: userData.last_name || "",
            profile_picture: userData.profile_picture || "./assets/images/no-image.png",
            unread_count: row.unread_count || 0
        };
    }));
    return mappedResults.filter(Boolean);
}

// sync messages support
export async function syncMessages(messages) {
    await checkDBReady();
    for (const msg of messages) {
        await saveLocalMessage(msg);
    }
}

// sync messages
export async function addPendingSync(type, payload) {
    await checkDBReady();
    await db.run(
        `INSERT INTO pending_sync (type, payload, created_at)
         VALUES (?, ?, ?)`,
        [type, JSON.stringify(payload), new Date().toISOString()]
    );
}

// get pending
export async function getPendingSync() {
    await checkDBReady();
    const res = await db.query(
        `SELECT * FROM pending_sync ORDER BY created_at ASC`
    );
    return res.values || [];
}

// remove pending
export async function removePendingSync(id) {
    await checkDBReady();
    await db.run(
        `DELETE FROM pending_sync WHERE id = ?`,
        [id]
    );
}

export { db };
