const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
app.post("/members", (req, res) => {
    const { membership_id, first_name, middle_initial, last_name, email, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id } = req.body;
    db.query(
        "INSERT INTO Member (membership_id, first_name, middle_initial, last_name, email, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [membership_id, first_name, middle_initial, last_name, email, phone_number, address, date_of_birth, sex, ssn, membership_type, visitor_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Member created" });
        }
    );
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
app.post("/staff", (req, res) => {
    const { staff_id, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule } = req.body;
    db.query(
        "INSERT INTO Staff (staff_id, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [staff_id, first_name, middle_initial, last_name, phone_number, address, date_of_birth, sex, ssn, staff_type, salary, schedule],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Staff created" });
        }
    );
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