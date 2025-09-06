const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

//error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Don't exit immediately for uncaught exceptions
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Test a simple query
    const count = await prisma.disease.count();
    console.log(`Database contains ${count} diseases`);
  } catch (err) {
    console.error("Database connection failed:", err);
    // Don't exit process, let the server start and show errors on API calls
  }
}

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// API endpoint: fetch all diseases
app.get("/api/diseases", async (req, res) => {
  try {
    console.log("Fetching diseases from database...");
    const diseases = await prisma.disease.findMany();
    
    console.log(`Successfully fetched ${diseases.length} diseases`);
    res.json(diseases);
  } catch (err) {
    console.error("Error fetching diseases:", err);
    res.status(500).json({ error: "Failed to fetch diseases" });
  }
});

// API endpoint: single disease by ID
app.get("/api/diseases/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate ID parameter
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const disease = await prisma.disease.findUnique({
      where: { id },
    });
    
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    
    res.json(disease);
  } catch (err) {
    console.error("Error fetching disease:", err);
    res.status(500).json({ error: "Failed to fetch disease" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK", database: "Connected" });
  } catch (err) {
    res.status(500).json({ status: "Error", database: "Disconnected", error: err.message });
  }
});

app.post("/api/diseases", async (req, res) => {
  try {
    const { name, crops, symptoms, prevention, treatment, severity, info } = req.body;
    
    // Validate required fields
    if (!name || !crops || !symptoms || !prevention || !treatment || !severity) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const newDisease = await prisma.disease.create({
      data: {
        name,
        crops,
        symptoms,
        prevention,
        treatment,
        severity,
        info: info || ""
      }
    });
    
    res.json(newDisease);
  } catch (err) {
    console.error("Error adding disease:", err);
    res.status(500).json({ error: "Failed to add disease" });
  }
});

// Catch-all: send index.html for frontend routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server with error handling
const server = app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  // Test database connection after server starts
  await testDatabaseConnection();
});

// Handle server errors (like port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    console.log('Try using a different port: PORT=3001 node server.js');
  } else {
    console.error('Server error:', err);
  }
});

//graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log("HTTP server closed.");
  });
  
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  } catch (err) {
    console.error("Error during Prisma disconnection:", err);
  }
  
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle any other cleanup
process.on("exit", (code) => {
  console.log(`Process exited with code: ${code}`);
});