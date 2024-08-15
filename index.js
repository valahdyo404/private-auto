require("dotenv").config();
const cron = require("node-cron");
const { absen } = require("./absen");
const db = require('./config/db');

async function main() {
  await db.initialize();
  cron.schedule("0 7 * * *", async () => {
    console.log("[INFO] - Start Procces", new Date().toLocaleString());
    const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
    setTimeout(async () => { await absen('masuk');}, delay);
    console.log("[INFO] - Finish Procces", new Date().toLocaleString());
  });
  
  cron.schedule("0 20 * * *", async () => {
    console.log("[INFO] - Start Procces", new Date().toLocaleString());
    // const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
    setTimeout(async () => { await absen('keluar');}, 100);
    console.log("[INFO] - Finish Procces", new Date().toLocaleString());
  });
}main();