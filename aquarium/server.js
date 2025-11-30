const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = "your-secret-key-change-this-in-production";

// Create a connection to your SQL database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Laundry78@78",
    database: "aquarium_db"
});

// Test the connection
db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        throw err;
    }
    console.log("MySQL connected to aquarium_db");
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
app.post('/auth/debug-create-staff', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not allowed in production' });
    }

    try {
        const {
            staff_id,
            username,
            password,
            first_name = null,
            middle_initial = null,
            last_name = null,
            phone_number = null,
            address = null,
            date_of_birth = null,
            sex = null,
            ssn = '000-00-0000',
            staff_type = 'Staff',
            salary = null,
            schedule = null,
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        // Ensure username doesn't already exist
        db.query('SELECT * FROM Staff WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) return res.status(409).json({ error: 'Username already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const id = staff_id || ('D' + Date.now().toString().slice(-6));

            db.query(
                "INSERT INTO Staff (staff_id, username, password, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [id, username, hashedPassword, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    return res.status(201).json({ message: 'Debug staff created', staff_id: id, username, staff_type });
                }
            );
        });
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
    db.query(
        "INSERT INTO Animal (animal_id, name, species, date_of_birth, sex, food_type, feeding_type, exhibit_id, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [animal_id, name, species, date_of_birth, sex, food_type, feeding_type, exhibit_id, tank_id],
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
    const { animal_id, aquarist_id, food_amount, feeding_time } = req.body;
    db.query(
        "INSERT INTO Feeding_Record (animal_id, aquarist_id, food_amount, feeding_time) VALUES (?, ?, ?, ?)",
        [animal_id, aquarist_id, food_amount, feeding_time],
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
    const { animal_id, vet_id, date, conditions, notes } = req.body;
    db.query(
        "INSERT INTO Health_Record (animal_id, vet_id, date, conditions, notes) VALUES (?, ?, ?, ?, ?)",
        [animal_id, vet_id, date, conditions, notes],
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

app.listen(5000, () => {
    console.log("Server running on port 5000");
    console.log("API available at http://localhost:5000");
});