const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

console.log("🚀 [DEBUG] Server initialization started...");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 [DEBUG] Express app created");

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = "your-secret-key-change-this-in-production";

console.log("🚀 [DEBUG] Setting up MySQL connection...");

// Create a connection to your SQL database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "197355",
    database: "aquarium_db"
});

// Test the connection
db.connect(err => {
    if (err) {
        console.error("❌ [DEBUG] Error connecting to MySQL:", err);
        throw err;
    }
    console.log("✅ [DEBUG] MySQL connected to aquarium_db");
});

// ==================== AUTHENTICATION MIDDLEWARE ====================

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTHENTICATION ROUTES ====================

// Register new staff member (with hashed password)
app.post("/auth/register", async (req, res) => {
    try {
        const { staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            "INSERT INTO Staff (staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [staff_id, username, hashedPassword, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: "Username or staff ID already exists" });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Staff member registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DEV-ONLY: Create a staff user with plaintext password; server hashes it.
// This endpoint is disabled in production environments.
app.post('/auth/debug-create-admin', async (req, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ [DEBUG-ADMIN] Attempt to create admin in production - blocked');
        return res.status(403).json({ error: 'Not allowed in production' });
    }

    console.log('🔍 [DEBUG-ADMIN] Admin creation endpoint called');

    try {
        const {
            username = 'admin',
            password = 'admin123', // Default password for dev
            first_name = 'Admin',
            last_name = 'User',
            staff_type = 'Admin'
        } = req.body;

        console.log(`🔍 [DEBUG-ADMIN] Checking if username "${username}" exists...`);

        // Check if username exists
        db.query('SELECT * FROM Staff WHERE username = ?', [username], async (err, results) => {
            if (err) {
                console.error('❌ [DEBUG-ADMIN] Database error checking username:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // If user already exists, return existing credentials
            if (results.length > 0) {
                const existing = results[0];
                console.log(`✅ [DEBUG-ADMIN] Admin '${username}' already exists - skipping creation`);
                
                return res.status(200).json({ 
                    message: 'Admin account already exists',
                    credentials: {
                        staff_id: existing.staff_id,
                        username: existing.username,
                        password: password, // Return the password you tried (assuming it's correct)
                        staff_type: existing.staff_type
                    },
                    note: 'If password is incorrect, use the debug-reset-password endpoint'
                });
            }

            // User doesn't exist - create new admin
            console.log(`🔍 [DEBUG-ADMIN] Username "${username}" does not exist - creating new admin...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            const staff_id = 'ADM' + Date.now().toString().slice(-6);
            console.log(`🔍 [DEBUG-ADMIN] Generated staff_id: ${staff_id}`);

            db.query(
                `INSERT INTO Staff (
                    staff_id, username, password, first_name, last_name, 
                    ssn, staff_type, salary, middle_initial, phone_number, 
                    address, date_of_birth, sex, schedule
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    staff_id, username, hashedPassword, first_name, last_name,
                    '000-00-0000', staff_type, 75000, null, null,
                    null, null, null, null
                ],
                (err, result) => {
                    if (err) {
                        console.error('❌ [DEBUG-ADMIN] Database error creating admin:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    console.log('\n');
                    console.log('╔════════════════════════════════════════════╗');
                    console.log('║  🎉 NEW ADMIN ACCOUNT CREATED SUCCESSFULLY  ║');
                    console.log('╚════════════════════════════════════════════╝');
                    console.log(`  Staff ID:  ${staff_id}`);
                    console.log(`  Username:  ${username}`);
                    console.log(`  Password:  ${password}`);
                    console.log(`  Role:      ${staff_type}`);
                    console.log('╔════════════════════════════════════════════╗\n');
                    
                    return res.status(201).json({
                        message: 'Admin account created successfully!',
                        credentials: {
                            staff_id,
                            username,
                            password,
                            staff_type
                        },
                        loginUrl: 'POST http://localhost:5000/auth/login'
                    });
                }
            );
        });
    } catch (error) {
        console.error('❌ [DEBUG-ADMIN] Unexpected error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bonus: Reset password for dev accounts
app.post('/auth/debug-reset-password', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not allowed in production' });
    }

    const { username = 'admin', newPassword = 'admin123' } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        db.query(
            'UPDATE Staff SET password = ? WHERE username = ?',
            [hashedPassword, username],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                console.log(`🔑 Password reset for '${username}' to '${newPassword}'`);
                
                res.json({
                    message: 'Password reset successfully',
                    credentials: { username, password: newPassword }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Quick endpoint to delete test accounts
app.delete('/auth/debug-delete-staff/:username', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not allowed in production' });
    }

    db.query('DELETE FROM Staff WHERE username = ?', [req.params.username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: `User '${req.params.username}' deleted successfully` });
    });
});

// Login staff member
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    db.query("SELECT * FROM Staff WHERE username = ?", [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        const staff = results[0];
        
        try {
            // Compare password with hashed password
            const validPassword = await bcrypt.compare(password, staff.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid username or password" });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    staff_id: staff.staff_id, 
                    username: staff.username,
                    staff_type: staff.staff_type,
                    user_type: 'staff'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Return token and user info (without password)
            res.json({
                message: "Login successful",
                token: token,
                staff: {
                    staff_id: staff.staff_id,
                    username: staff.username,
                    first_name: staff.first_name,
                    last_name: staff.last_name,
                    staff_type: staff.staff_type
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Get current logged-in user info
app.get("/auth/me", authenticateToken, (req, res) => {
    if (req.user.user_type !== 'staff') {
        return res.status(403).json({ error: "Access denied. Staff only." });
    }
    
    db.query("SELECT staff_id, username, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, staff_type, salary, schedule FROM Staff WHERE staff_id = ?", 
        [req.user.staff_id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Staff member not found" });
            }
            res.json(results[0]);
        }
    );
});

// Change password
app.put("/auth/change-password", authenticateToken, async (req, res) => {
    if (req.user.user_type !== 'staff') {
        return res.status(403).json({ error: "Access denied. Staff only." });
    }
    
    const { oldPassword, newPassword } = req.body;
    
    try {
        // Get current password
        db.query("SELECT password FROM Staff WHERE staff_id = ?", [req.user.staff_id], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const staff = results[0];
            const validPassword = await bcrypt.compare(oldPassword, staff.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            db.query("UPDATE Staff SET password = ? WHERE staff_id = ?", 
                [hashedPassword, req.user.staff_id], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Password changed successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MEMBER AUTHENTICATION ROUTES ====================

// Register new member (with hashed password)
app.post("/auth/member/register", async (req, res) => {
    try {
        const { membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            "INSERT INTO Member (membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [membership_id, first_name, middle_initial, last_name, email, hashedPassword, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: "Email or membership ID already exists" });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Member registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Member login
app.post("/auth/member/login", (req, res) => {
    const { email, password } = req.body;
    
    db.query("SELECT * FROM Member WHERE email = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const member = results[0];
        
        try {
            // Compare password with hashed password
            const validPassword = await bcrypt.compare(password, member.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    membership_id: member.membership_id, 
                    email: member.email,
                    membership_type: member.membership_type,
                    user_type: 'member'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Return token and user info (without password)
            res.json({
                message: "Login successful",
                token: token,
                member: {
                    membership_id: member.membership_id,
                    email: member.email,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    membership_type: member.membership_type
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Get current logged-in member info
app.get("/auth/member/me", authenticateToken, (req, res) => {
    if (req.user.user_type !== 'member') {
        return res.status(403).json({ error: "Access denied. Members only." });
    }
    
    db.query("SELECT membership_id, first_name, middle_initial, last_name, email, phone_number, address, date_of_birth, sex, membership_type, visitor_id FROM Member WHERE membership_id = ?", 
        [req.user.membership_id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Member not found" });
            }
            res.json(results[0]);
        }
    );
});

// Member change password
app.put("/auth/member/change-password", authenticateToken, async (req, res) => {
    if (req.user.user_type !== 'member') {
        return res.status(403).json({ error: "Access denied. Members only." });
    }
    
    const { oldPassword, newPassword } = req.body;
    
    try {
        // Get current password
        db.query("SELECT password FROM Member WHERE membership_id = ?", [req.user.membership_id], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const member = results[0];
            const validPassword = await bcrypt.compare(oldPassword, member.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            db.query("UPDATE Member SET password = ? WHERE membership_id = ?", 
                [hashedPassword, req.user.membership_id], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Password changed successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== FEATURED EXHIBITS (for Home Page) ====================
app.get("/featured-exhibits", (req, res) => {
    const query = `
        SELECT
            E.exhibit_id,
            E.exhibit_name,
            E.location,
            CONCAT(S.first_name, ' ', S.last_name) AS lead_aquarist_name
        FROM Exhibit E
        JOIN Staff S ON E.lead_aquarist_id = S.staff_id
        LIMIT 3
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching featured exhibits:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.get("/exhibits-details", (req, res) => {
    const query = `
        SELECT 
            E.exhibit_id,
            E.exhibit_name,
            E.location,
            -- COALESCE handles cases where lead_aquarist_id might be NULL or invalid
            COALESCE(CONCAT(S.first_name, ' ', S.last_name), 'Unassigned') AS lead_aquarist_name,
            -- Faster COUNT using subqueries for specific exhibit_id
            (SELECT COUNT(T.tank_id) FROM Tank T WHERE T.exhibit_id = E.exhibit_id) AS total_tanks,
            (SELECT COUNT(A.animal_id) FROM Animal A WHERE A.exhibit_id = E.exhibit_id) AS total_animals
        FROM Exhibit E
        LEFT JOIN Staff S ON E.lead_aquarist_id = S.staff_id; -- Use LEFT JOIN to return ALL exhibits
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching exhibits details:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.get("/exhibits-details/:id", (req, res) => {
    const exhibitId = req.params.id;
    const query = `
        SELECT 
            E.exhibit_name,
            E.location,
            COALESCE(CONCAT(S.first_name, ' ', S.last_name), 'Unassigned') AS lead_aquarist_name,
            T.tank_id,
            T.tank_type,
            T.water_type,
            T.tank_size /* Querying the correct column */
        FROM Exhibit E
        LEFT JOIN Staff S ON E.lead_aquarist_id = S.staff_id
        LEFT JOIN Tank T ON E.exhibit_id = T.exhibit_id
        WHERE E.exhibit_id = ?
        ORDER BY T.tank_id;
    `;
    db.query(query, [exhibitId], (err, result) => {
        if (err) {
            console.error("Error fetching single exhibit details:", err);
            return res.status(500).json({ error: "Database error during detail fetch." });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: "Exhibit not found or has no tanks." });
        }
        
        // Group the flat SQL result into a structured object
        const exhibit = {
            exhibit_name: result[0].exhibit_name,
            location: result[0].location,
            lead_aquarist_name: result[0].lead_aquarist_name,
            tanks: result.map(row => ({
                tank_id: row.tank_id,
                tank_type: row.tank_type,
                water_type: row.water_type,
                tank_size: row.tank_size // <--- *** THIS IS THE CRITICAL ADDITION ***
            })).filter(tank => tank.tank_id !== null) 
        };
        
        res.json(exhibit);
    });
});

// ==================== AUTHENTICATION MIDDLEWARE ====================

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTHENTICATION ROUTES ====================

// Register new staff member (with hashed password)
app.post("/auth/register", async (req, res) => {
    try {
        const { staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            "INSERT INTO Staff (staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [staff_id, username, hashedPassword, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: "Username or staff ID already exists" });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Staff member registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login staff member
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    db.query("SELECT * FROM Staff WHERE username = ?", [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        const staff = results[0];
        
        try {
            // Compare password with hashed password
            const validPassword = await bcrypt.compare(password, staff.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid username or password" });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    staff_id: staff.staff_id, 
                    username: staff.username,
                    staff_type: staff.staff_type 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Return token and user info (without password)
            res.json({
                message: "Login successful",
                token: token,
                staff: {
                    staff_id: staff.staff_id,
                    username: staff.username,
                    first_name: staff.first_name,
                    last_name: staff.last_name,
                    staff_type: staff.staff_type
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Get current logged-in user info
app.get("/auth/me", authenticateToken, (req, res) => {
    db.query("SELECT staff_id, username, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, staff_type, salary, schedule FROM Staff WHERE staff_id = ?", 
        [req.user.staff_id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Staff member not found" });
            }
            res.json(results[0]);
        }
    );
});

// Change password
app.put("/auth/change-password", authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    try {
        // Get current password
        db.query("SELECT password FROM Staff WHERE staff_id = ?", [req.user.staff_id], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const staff = results[0];
            const validPassword = await bcrypt.compare(oldPassword, staff.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            db.query("UPDATE Staff SET password = ? WHERE staff_id = ?", 
                [hashedPassword, req.user.staff_id], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Password changed successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MEMBER AUTHENTICATION ROUTES ====================

// Register new member (with hashed password)
app.post("/auth/member/register", async (req, res) => {
    try {
        const { membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            "INSERT INTO Member (membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [membership_id, first_name, middle_initial, last_name, email, hashedPassword, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: "Email or membership ID already exists" });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Member registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Member login
app.post("/auth/member/login", (req, res) => {
    const { email, password } = req.body;
    
    db.query("SELECT * FROM Member WHERE email = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const member = results[0];
        
        try {
            // Compare password with hashed password
            const validPassword = await bcrypt.compare(password, member.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    membership_id: member.membership_id, 
                    email: member.email,
                    membership_type: member.membership_type,
                    user_type: 'member'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Return token and user info (without password)
            res.json({
                message: "Login successful",
                token: token,
                member: {
                    membership_id: member.membership_id,
                    email: member.email,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    membership_type: member.membership_type
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Get current logged-in member info
app.get("/auth/member/me", authenticateToken, (req, res) => {
    if (req.user.user_type !== 'member') {
        return res.status(403).json({ error: "Access denied. Members only." });
    }
    
    db.query("SELECT membership_id, first_name, middle_initial, last_name, email, phone_number, address, date_of_birth, sex, membership_type, visitor_id FROM Member WHERE membership_id = ?", 
        [req.user.membership_id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Member not found" });
            }
            res.json(results[0]);
        }
    );
});

// Member change password
app.put("/auth/member/change-password", authenticateToken, async (req, res) => {
    if (req.user.user_type !== 'member') {
        return res.status(403).json({ error: "Access denied. Members only." });
    }
    
    const { oldPassword, newPassword } = req.body;
    
    try {
        // Get current password
        db.query("SELECT password FROM Member WHERE membership_id = ?", [req.user.membership_id], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const member = results[0];
            const validPassword = await bcrypt.compare(oldPassword, member.password);
            
            if (!validPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            db.query("UPDATE Member SET password = ? WHERE membership_id = ?", 
                [hashedPassword, req.user.membership_id], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Password changed successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== VISITOR ROUTES ====================

// Get all visitors
app.get("/visitors", (req, res) => {
    db.query("SELECT * FROM Visitor", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get visitor by ID
app.get("/visitors/:id", (req, res) => {
    db.query("SELECT * FROM Visitor WHERE visitor_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Visitor not found" });
        res.json(result[0]);
    });
});

// Create new visitor
app.post("/visitors", (req, res) => {
    const { first_name, middle_initial, last_name, exhibit_name } = req.body;
    db.query(
        "INSERT INTO Visitor (first_name, middle_initial, last_name, exhibit_name) VALUES (?, ?, ?, ?)",
        [first_name, middle_initial, last_name, exhibit_name],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: "Visitor created" });
        }
    );
});

// Update visitor
app.put("/visitors/:id", (req, res) => {
    const { first_name, middle_initial, last_name, exhibit_name } = req.body;
    db.query(
        "UPDATE Visitor SET first_name = ?, middle_initial = ?, last_name = ?, exhibit_name = ? WHERE visitor_id = ?",
        [first_name, middle_initial, last_name, exhibit_name, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Visitor updated" });
        }
    );
});

// Delete visitor
app.delete("/visitors/:id", (req, res) => {
    db.query("DELETE FROM Visitor WHERE visitor_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Visitor deleted" });
    });
});

// ==================== MEMBER ROUTES ====================

// Get all members
app.get("/members", (req, res) => {
    db.query("SELECT * FROM Member", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get member by ID
app.get("/members/:id", (req, res) => {
    db.query("SELECT * FROM Member WHERE membership_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Member not found" });
        res.json(result[0]);
    });
});

// Create new member
app.post("/members", async (req, res) => {
    try {
        const { membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id } = req.body;
        
        // Hash password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        
        db.query(
            "INSERT INTO Member (membership_id, first_name, middle_initial, last_name, email, password, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [membership_id, first_name, middle_initial, last_name, email, hashedPassword, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "Member created" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STAFF ROUTES ====================

// Get all staff
app.get("/staff", (req, res) => {
    db.query("SELECT * FROM Staff", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get staff by ID
app.get("/staff/:id", (req, res) => {
    db.query("SELECT * FROM Staff WHERE staff_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Staff not found" });
        res.json(result[0]);
    });
});

// Create new staff
app.post("/staff", async (req, res) => {
    try {
        const { staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule } = req.body;
        
        // Hash password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        
        db.query(
            "INSERT INTO Staff (staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [staff_id, username, hashedPassword, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "Staff created" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EXHIBIT ROUTES ====================

// Get all exhibits
app.get("/exhibits", (req, res) => {
    db.query("SELECT * FROM Exhibit", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get exhibit by ID
app.get("/exhibits/:id", (req, res) => {
    db.query("SELECT * FROM Exhibit WHERE exhibit_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Exhibit not found" });
        res.json(result[0]);
    });
});

// Create new exhibit
app.post("/exhibits", (req, res) => {
    const { exhibit_id, exhibit_name, location, lead_aquarist_id } = req.body;
    db.query(
        "INSERT INTO Exhibit (exhibit_id, exhibit_name, location, lead_aquarist_id) VALUES (?, ?, ?, ?)",
        [exhibit_id, exhibit_name, location, lead_aquarist_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Exhibit created" });
        }
    );
});

// ==================== ANIMAL ROUTES ====================

// Get all animals
app.get("/animals", (req, res) => {
    db.query("SELECT * FROM Animal", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get animal by ID
app.get("/animals/:id", (req, res) => {
    db.query("SELECT * FROM Animal WHERE animal_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Animal not found" });
        res.json(result[0]);
    });
});

// Get animals by species
app.get("/animals/species/:species", (req, res) => {
    db.query("SELECT * FROM Animal WHERE species = ?", [req.params.species], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Create new animal
app.post("/animals", (req, res) => {
  const { animal_id, name, species, date_of_birth, sex, food_type, feeding_type, exhibit_id, tank_id } = req.body;

  // 3. DATA CLEANUP: Convert empty strings from the form to NULL for the database.
  // This is vital for Date and CHAR(1) columns to prevent MySQL errors.
  let clean_date_of_birth = date_of_birth ? date_of_birth.substring(0, 10) : null;
  const clean_sex = sex || null;
  const clean_tank_id = tank_id || null;
  
  
  db.query(
    "INSERT INTO Animal (animal_id, name, species, date_of_birth, sex, food_type, feeding_type, exhibit_id, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [animal_id, name, species, clean_date_of_birth, clean_sex, food_type, feeding_type, exhibit_id, clean_tank_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Animal created" });
    }
  );
});

// ==================== TANK ROUTES ====================

// Get all tanks
app.get("/tanks", (req, res) => {
    db.query("SELECT * FROM Tank", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get tank by ID
app.get("/tanks/:id", (req, res) => {
    db.query("SELECT * FROM Tank WHERE tank_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Tank not found" });
        res.json(result[0]);
    });
});

// In server.js

// Function 3: POST route to add a new Tank
app.post("/tanks", (req, res) => {
  const { tank_id, tank_size, tank_type, water_type, exhibit_id } = req.body;

  const clean_tank_id = tank_id || null; // This should be provided, but use null just in case
  const clean_tank_size = tank_size || null;
  const clean_tank_type = tank_type || null;
  const clean_water_type = water_type || null;
  const clean_exhibit_id = exhibit_id || null; // exhibit_id is NULLABLE in your DB schema.
  const query = `INSERT INTO Tank (tank_id, tank_size, tank_type, water_type, exhibit_id) VALUES (?, ?, ?, ?, ?)`;
  
  db.query(
    query, 
    [clean_tank_id, clean_tank_size, clean_tank_type, clean_water_type, clean_exhibit_id], 
    (err, result) => {
      if (err) {
        console.error("SQL Error adding tank:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Tank created successfully", tank_id: clean_tank_id });
    }
  );
});

// ==================== FEEDING RECORD ROUTES ====================

// Get all feeding records
app.get("/feeding-records", (req, res) => {
    db.query("SELECT * FROM Feeding_Record", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get feeding records by animal
app.get("/feeding-records/animal/:animal_id", (req, res) => {
    db.query("SELECT * FROM Feeding_Record WHERE animal_id = ?", [req.params.animal_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Create feeding record
app.post("/feeding-records", (req, res) => {
    const { feeding_id, animal_id, aquarist_id, food_amount, feeding_time } = req.body;
    db.query(
        "INSERT INTO Feeding_Record (feeding_id, animal_id, aquarist_id, food_amount, feeding_time) VALUES (?, ?, ?, ?, ?)",
        [feeding_id, animal_id, aquarist_id, food_amount, feeding_time],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: "Feeding record created" });
        }
    );
});

// ==================== HEALTH RECORD ROUTES ====================

// Get all health records
app.get("/health-records", (req, res) => {
    db.query("SELECT * FROM Health_Record", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get health records by animal
app.get("/health-records/animal/:animal_id", (req, res) => {
    db.query("SELECT * FROM Health_Record WHERE animal_id = ?", [req.params.animal_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Create health record
app.post("/health-records", (req, res) => {
    const { record_id, animal_id, vet_id, date, conditions, notes } = req.body;
    db.query(
        "INSERT INTO Health_Record (record_id, animal_id, vet_id, date, conditions, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [record_id, animal_id, vet_id, date, conditions, notes],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: "Health record created" });
        }
    );
});

// ==================== PROGRAM ROUTES ====================

// Get all programs
app.get("/programs", (req, res) => {
    db.query("SELECT * FROM Program", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get program by ID
app.get("/programs/:id", (req, res) => {
    db.query("SELECT * FROM Program WHERE program_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Program not found" });
        res.json(result[0]);
    });
});

// ==================== COMPLEX QUERIES ====================

// Get animals with their exhibit and tank info
app.get("/animals-detailed", (req, res) => {
    const query = `
        SELECT a.*, e.exhibit_name, e.location, t.tank_type, t.water_type
        FROM Animal a
        LEFT JOIN Exhibit e ON a.exhibit_id = e.exhibit_id
        LEFT JOIN Tank t ON a.tank_id = t.tank_id
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get staff members by type
app.get("/staff/type/:type", (req, res) => {
    db.query("SELECT * FROM Staff WHERE staff_type = ?", [req.params.type], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get exhibits with animal count
app.get("/exhibits-stats", (req, res) => {
    const query = `
        SELECT e.*, COUNT(a.animal_id) as animal_count
        FROM Exhibit e
        LEFT JOIN Animal a ON e.exhibit_id = a.exhibit_id
        GROUP BY e.exhibit_id
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({ 
        message: "Aquarium Management API",
        endpoints: {
            staff_auth: {
                login: "POST /auth/login",
                register: "POST /auth/register",
                me: "GET /auth/me (requires token)",
                changePassword: "PUT /auth/change-password (requires token)"
            },
            member_auth: {
                login: "POST /auth/member/login",
                register: "POST /auth/member/register",
                me: "GET /auth/member/me (requires token)",
                changePassword: "PUT /auth/member/change-password (requires token)"
            },
            visitors: "/visitors",
            members: "/members",
            staff: "/staff",
            exhibits: "/exhibits",
            animals: "/animals",
            tanks: "/tanks",
            feeding_records: "/feeding-records",
            health_records: "/health-records",
            programs: "/programs"
        }
    });
});

// ==================== AUTO-CREATE ADMIN ON STARTUP ====================

function createDefaultAdmin() {
    console.log('🔍 [DEBUG-ADMIN] Attempting to create default admin account...');
    
    const username = 'admin';
    const password = 'admin123';
    const first_name = 'Admin';
    const last_name = 'User';
    const staff_type = 'Admin';

    // Check if username exists
    db.query('SELECT * FROM Staff WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('❌ [DEBUG-ADMIN] Database error checking username:', err);
            return;
        }
        
        // If user already exists, just log it
        if (results.length > 0) {
            const existing = results[0];
            console.log(`✅ [DEBUG-ADMIN] Admin '${username}' already exists`);
            return;
        }

        // User doesn't exist - create new admin
        console.log(`🔍 [DEBUG-ADMIN] Username "${username}" does not exist - creating new admin...`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const staff_id = 'ADM' + Date.now().toString().slice(-6);
        console.log(`🔍 [DEBUG-ADMIN] Generated staff_id: ${staff_id}`);

        db.query(
            `INSERT INTO Staff (
                staff_id, username, password, first_name, last_name, 
                ssn, staff_type, salary, middle_initial, phone_number, 
                address, date_of_birth, sex, schedule
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                staff_id, username, hashedPassword, first_name, last_name,
                '000-00-0001', staff_type, 75000, null, null,
                null, null, null, null
            ],
            (err, result) => {
                if (err) {
                    console.error('❌ [DEBUG-ADMIN] Database error creating admin:', err);
                    return;
                }
                
                console.log('\n');
                console.log('╔════════════════════════════════════════════╗');
                console.log('║  🎉 NEW ADMIN ACCOUNT CREATED SUCCESSFULLY  ║');
                console.log('╚════════════════════════════════════════════╝');
                console.log(`  Staff ID:  ${staff_id}`);
                console.log(`  Username:  ${username}`);
                console.log(`  Password:  ${password}`);
                console.log(`  Role:      ${staff_type}`);
                console.log('╔════════════════════════════════════════════╝\n');
            }
        );
    });
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ [DEBUG] Server Successfully Started!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log("═══════════════════════════════════════════════════════\n");
    
    // Create default admin account on startup
    console.log('🚀 [DEBUG] Initializing default admin account...\n');
    createDefaultAdmin();
});