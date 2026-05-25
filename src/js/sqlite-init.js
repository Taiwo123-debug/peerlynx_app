import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db = null;
let initPromise = null;

// Initialize SQLite DB safely with HMR protection
export async function initSQLiteDB() {
    if (db) return db;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Check if the connection manager tracks this connection cleanly
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
                    // This intercepts the "already exists" but "does not exist" paradox
                    if (createErr.message?.includes("already exists")) {
                        console.warn("Ghost connection lock detected. Evicting native handle...");
                        
                        try {
                            // Force clear the corrupted native handle out of memory
                            await sqlite.closeConnection("peerlynx_db", false);
                            console.log("Ghost connection evicted successfully.");
                        }
                        catch (closeErr) {
                            console.log("Eviction notice bypassed or connection was not open:", closeErr.message);
                        }

                        // Try to create the clean connection handle again
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

            // Ensure the connection is actually open
            const isDbOpen = await db.isDBOpen();
            if (!isDbOpen.result) {
                await db.open();
                console.log("SQLite DB connection opened successfully.");
            }

            // Set up the schema tables
            await createTables();
            return db;
        }
        catch (error) {
            console.error("SQLite init error:", error);
            initPromise = null;
            db = null;
            throw error;
        }
    })();
    return initPromise;
}

// Internal runner for setting up schemas
async function createTables() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            tutor_id TEXT,
            last_message TEXT,
            last_time TEXT,
            unread_count INTEGER DEFAULT 0
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
}

// Safe internal database check wrapper
async function checkDBReady() {
    if (!db) {
        console.warn("DB reference null. Attempting fast-tracked runtime restoration...");
        await initSQLiteDB();
    }
    if (!db) {
        throw new Error("SQLite database operation failed: DB is not initialized.");
    }
}

// Save messages
export async function saveLocalMessage(msg) {
    try {
        if (!msg) return console.error("Cannot save message: message payload is undefined");
        await checkDBReady();

        await db.run(
            `INSERT INTO messages 
            (conversation_id, sender_id, receiver_id, message, message_type, is_read, sync_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                msg.conversation_id,
                msg.sender_id,
                msg.receiver_id,
                msg.message,
                msg.message_type || "text",
                0,
                "pending",
                msg.created_at || new Date().toISOString()
            ]
        );
        console.log("saved to local")
    }
    catch (err) {
        console.error("Save message error:", err);
    }
}

// Get messages
export async function getMessages(conversation_id) {
    try {
        await checkDBReady();
        const res = await db.query(
            `SELECT * FROM messages 
             WHERE conversation_id = ? 
             ORDER BY created_at ASC`,
            [conversation_id]
        );
        return res.values || [];
    }
    catch (err) {
        console.error("Get messages error:", err);
        return [];
    }
}

// Update conversations
export async function updateConversationPreview(data) {
    try {
        await checkDBReady();
        const existing = await db.query(`SELECT * FROM conversations WHERE id = ?`, [data.conversation_id]);

        if (!existing.values || existing.values.length === 0) {
            await db.run(
                `INSERT INTO conversations 
                (id, student_id, tutor_id, last_message, last_time, unread_count)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    data.conversation_id,
                    data.student_id,
                    data.tutor_id,
                    data.last_message,
                    new Date().toISOString(),
                    1
                ]
            );
        }
        else {
            await db.run(
                `UPDATE conversations 
                SET last_message = ?, last_time = ?, unread_count = unread_count + 1
                WHERE id = ?`,
                [
                    data.last_message,
                    new Date().toISOString(),
                    data.conversation_id
                ]
            );
        }
    }
    catch (err) {
        console.error("Conversation update error:", err);
    }
}

// Mark as read
export async function markAsRead(conversation_id, user_id) {
    try {
        await checkDBReady();
        await db.run(
            `UPDATE messages 
             SET is_read = 1 
             WHERE conversation_id = ? AND receiver_id = ?`,
            [conversation_id, user_id]
        );

        await db.run(
            `UPDATE conversations 
             SET unread_count = 0 
             WHERE id = ?`,
            [conversation_id]
        );
    }
    catch (err) {
        console.error("Mark as read error:", err);
    }
}

// Conversations
export async function getConversations() {
    try {
        await checkDBReady();
        const res = await db.query(
            `SELECT * FROM conversations ORDER BY last_time DESC`
        );
        return res.values || [];
    }
    catch (err) {
        console.error("Get conversations error:", err);
        return [];
    }
}

// Offline sync
export async function addPendingSync(type, payload) {
    try {
        await checkDBReady();
        await db.run(
            `INSERT INTO pending_sync (type, payload, created_at)
             VALUES (?, ?, ?)`,
            [
                type,
                JSON.stringify(payload),
                new Date().toISOString()
            ]
        );
    }
    catch (err) {
        console.error("Add pending sync error:", err);
    }
}

export async function getPendingSync() {
    try {
        await checkDBReady();
        const res = await db.query(`SELECT * FROM pending_sync ORDER BY created_at ASC`);
        return res.values || [];
    }
    catch (err) {
        console.error("Get pending sync error:", err);
        return [];
    }
}

export async function removePendingSync(id) {
    try {
        await checkDBReady();
        await db.run(`DELETE FROM pending_sync WHERE id = ?`, [id]);
    }
    catch (err) {
         console.error("Remove pending sync error:", err);
    }
}

export async function getChatList(userEmail) {
    try {
        const res = await db.query(`
            SELECT *
            FROM (
                SELECT 
                    m.*,
                    ROW_NUMBER() OVER (
                        PARTITION BY conversation_id 
                        ORDER BY created_at DESC, id DESC
                    ) AS rn
                FROM messages m
            ) ranked
            WHERE rn = 1
            ORDER BY created_at DESC;
        `);

        const rows = res.values || [];

        const completeChatList = await Promise.all(
            rows.map(async (row) => {
                const isSender = row.sender_id === userEmail;
                const otherUser = isSender ? row.receiver_id : row.sender_id;

                let serverUserData = {};

                try {
                    const url = `https://peerlynx-server.onrender.com/user-data?email=${encodeURIComponent(otherUser)}`;
                    const response = await fetch(url);

                    if (response.ok) {
                        const result = await response.json();
                        serverUserData = result.data || result;
                    }
                } catch (err) {
                    console.error(err);
                }

                return {
                    conversation_id: row.conversation_id,
                    last_message: row.message,
                    last_time: row.created_at,
                    other_user: otherUser,
                    first_name: serverUserData?.first_name || "",
                    last_name: serverUserData?.last_name || "",
                    profile_picture: serverUserData?.profile_picture || "./assets/images/no-image.png"
                };
            })
        );

        return completeChatList;
    } catch (error) {
        console.error("Get chat list error:", error);
        return [];
    }
}

export async function updateLocalMessageId(oldId, newId) {
    try {
        await checkDBReady();
        await db.run(
            `UPDATE messages SET id = ?, sync_status = 'synced' WHERE id = ?`,
            [newId, oldId]
        );
        console.log(`[SQLite] Id mutated successfully: ${oldId} -> ${newId}`);
        return true;
    }
    catch (err) {
        console.error("[SQLite] Error executing key update mutation:", err);
        return false;
    }
}

export { db };
