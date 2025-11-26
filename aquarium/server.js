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
    database: "hw6_db"
});

// Test the connection
db.connect(err => {
    if (err) throw err;
    console.log("MySQL connected");
});

// Example route
app.get("/users", (req, res) => {
    db.query("SELECT * FROM j", (err, result) => {
        if (err) return res.send(err);
        res.send(result);
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
