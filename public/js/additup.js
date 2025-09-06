const { PrismaClient } = require("@prisma/client");
const readline = require("readline");
const fs = require("fs");

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function manualInsert() {
  try {
    console.log("🌱 Manual Disease Data Insertion\n");
    
    const name = await askQuestion("Disease name: ");
    const crops = await askQuestion("Affected crops: ");
    const symptoms = await askQuestion("Symptoms: ");
    const prevention = await askQuestion("Prevention methods: ");
    const treatment = await askQuestion("Treatment methods: ");
    const severity = await askQuestion("Severity (high/medium/low): ");
    const info = await askQuestion("Additional info: ");

    // Insert into database
    const newDisease = await prisma.disease.create({
      data: {
        name,
        crops,
        symptoms,
        prevention,
        treatment,
        severity,
        info
      }
    });

    console.log("\n Disease added successfully!");
    console.log(`ID: ${newDisease.id}`);
    console.log(`Name: ${newDisease.name}`);
    
    // Ask if user wants to add another disease
    const addAnother = await askQuestion("\nAdd another disease? (y/n): ");
    if (addAnother.toLowerCase() === 'y') {
      await manualInsert();
    } else {
      console.log("Goodbye!");
      rl.close();
    }
  } catch (error) {
    console.error(" Error inserting disease:", error);
    rl.close();
  }
}

async function bulkInsertFromJSON() {
  try {
    console.log(" Bulk Insert from JSON File\n");
    const filePath = await askQuestion("Enter JSON file path: ");
    
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`Found ${data.length} diseases to insert`);
    
    for (const disease of data) {
      await prisma.disease.create({
        data: {
          name: disease.name,
          crops: disease.crops,
          symptoms: disease.symptoms,
          prevention: disease.prevention,
          treatment: disease.treatment,
          severity: disease.severity,
          info: disease.info,
        }
      });
      console.log(`Inserted: ${disease.name}`);
    }
    
    console.log("\nBulk insertion completed!");
  } catch (error) {
    console.error("Error in bulk insertion:", error);
  }
}

async function main() {
  console.log(" Disease Database Management");
  console.log("1. Manual single disease insertion");
  console.log("2. Bulk insert from JSON file");
  console.log("3. Exit");
  
  const choice = await askQuestion("\nSelect option (1-3): ");
  
  switch (choice) {
    case '1':
      await manualInsert();
      break;
    case '2':
      await bulkInsertFromJSON();
      break;
    case '3':
      console.log("Goodbye!");
      rl.close();
      break;
    default:
      console.log(" Invalid option");
      rl.close();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });