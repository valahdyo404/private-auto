require("dotenv").config();
const express = require('express');
const cron = require("node-cron");
const { absen } = require("./absen");
const db = require('./config/db');
const app = express();

app.listen(3000, () => {
  console.log("Server running on port 3000");
  app.get("/", async (req, res, next) => {
		try {
			const data = {
				status: "Health Check Success",
				date: new Date().toLocaleString(),
				uptime: `${Math.round(process.uptime())} second`
			};
			res.status(200).json({
				msg: "Auto Service",
				data
			});
		} catch (error) {
			next(error);
		}
	});
  async function main() {
    await db.initialize();
    cron.schedule("0 1 * * *", async () => {
      console.log("[INFO] - Start Procces", new Date().toLocaleString());
      // const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
      // await new Promise(res => setTimeout(res, delay))
      await absen('masuk');
      console.log("[INFO] - Finish Procces", new Date().toLocaleString());
    });
  
    cron.schedule("30 12 * * *", async () => {
      console.log("[INFO] - Start Procces", new Date().toLocaleString());
      // const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
      // await new Promise(res => setTimeout(res, delay))
      await absen('keluar');
      console.log("[INFO] - Finish Procces", new Date().toLocaleString());
    });
    cron.schedule("* * * * *", async () => {
      // await absen('masuk');
      console.log("[INFO] - Log Process", new Date().toLocaleString()); 
    });
  }main();
})