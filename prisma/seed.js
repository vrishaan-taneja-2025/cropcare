const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  try {
    // Reset the sequence to start from 1
    await prisma.$executeRaw`ALTER SEQUENCE "Disease_id_seq" RESTART WITH 1;`;
    console.log("Disease ID sequence reset to start from 1");

    // Read and parse the disease data
    const data = JSON.parse(fs.readFileSync("./data/diseases.json", "utf-8"));
    console.log(`Found ${data.length} diseases to insert`);

    // Insert diseases in order
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
        },
      });
      console.log(` Inserted: ${disease.name}`);
    }
    
    console.log("All seed data inserted successfully!");
    
    // Verify the count
    const count = await prisma.disease.count();
    console.log(` Total diseases in database: ${count}`);
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
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