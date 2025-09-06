const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync("./data/diseases.json", "utf-8"));

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
  }
  console.log("Seed data inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());