require("dotenv").config();
const express = require('express');
const cron = require("node-cron");
const { absen } = require("./absen");
const db = require('./config/db');

express().listen(3000, () => {
  console.log("Server running on port 3000");
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
    cron.schedule("0 * * * *", async () => {
      console.log("[INFO] - Log Process", new Date().toLocaleString()); 
    });
  }main();
})