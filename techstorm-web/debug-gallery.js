const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGallery() {
  try {
    const count = await prisma.galleryImage.count();
    console.log(`Total images in DB: ${count}`);
    
    const images = await prisma.galleryImage.findMany();
    console.log("Images:", JSON.stringify(images, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

checkGallery();
