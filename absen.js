const puppeteer = require('puppeteer');
const db = require('./config/db');
const { default: axios } = require('axios');

async function absen(type='masuk') {
  try {
    const users = await getDataUser(type);
    const today = new Date();
    let isWeekend = false;
    let latar = 'WFO';
    if(today.getDay() == 6 || today.getDay() == 0) {
      isWeekend = true;
      latar = 'WFS';
    }
    // for (let index = 0; index < users.length; index++) {
    //   if (!users[index]?.is_weekend && isWeekend) continue
    //   const user = users[index];
    //   if (type == 'masuk') {
    //      absenMasuk(user.username, user.password, user.location, latar);
    //   } else if (type =='keluar') {
    //       const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
    //        new Promise(res => setTimeout(res, delay + (user.plus_minute_keluar * 60 * 1000)));
    //       const activities =  getAktivitas(user.username);
    //       const activity = randomActivities(activities)
    //        absenPulang(user.username, user.password, activity, user.location, latar);
    //   }
    //   await new Promise(res => setTimeout(res, 4000));
    // }
    console.log(new Date(), "Start Eksekusi Absen")
    const delayProc = users.map(user => {
      const delay = ((Math.round(Math.random() * 30) + 2) * 60 * 1000)
      if (!user?.is_weekend && isWeekend) return;
      if (type == 'masuk') {
         const delayPlusMinute = delay + (user.plus_minute_masuk * 60 * 1000)
         return absenMasuk(user.username, user.password, user.location, latar, delayPlusMinute)
      } else if (type =='keluar') {
          const activities =  getAktivitas(user.username);
          const activity = randomActivities(activities)
          const delayPlusMinute = delay + (user.plus_minute_keluar * 60 * 1000);
          return absenPulang(user.username, user.password, activity, user.location, latar, delayPlusMinute);
      }
    })
    await Promise.all(delayProc)
    console.log(new Date(), "Finish Ekesekusi Absen")
    
  } catch (error) {
    console.log(error);
  }
}
async function getDataUser(type) {
  try {
    let where = ''
    if (type == 'masuk') where += `AND IS_MASUK = '1'`;
    else if (type == 'keluar') where += `AND IS_KELUAR = '1'`;
    const { rows } = await db.query(`SELECT username, password, location, is_weekend, plus_minute_keluar, plus_minute_masuk FROM users WHERE 1=1 ${where}`);
    return rows
  } catch (error) {
    console.log(error)
  }
}

async function absenMasuk(username, password, location, latar, delayPlusMinute = 0) {
  // return new Promise(async (resolve, reject) => {
    try {
      const minute = delayPlusMinute/1000/60; 
      await new Promise(resolve => setTimeout(() => resolve(console.log(minute, "Delay exectued")), delayPlusMinute))
      const latitude = location?.split(';')[0] || '-6.149751593365433';  
      const longitude = location?.split(';')[1] || '106.88824671984855';
      const alamat = location?.split(';')[2] || 'Jalan+Mitra+Sunter+Boulevard%2C+RW+11%2C+Sunter+Jaya%2C+Tanjung+Priok%2C+North+Jakarta%2C+Special+capital+Region+of+Jakarta%2C+Java%2C+14350%2C+Indonesia';
      const params = new URLSearchParams()
      params.append('username', username);
      params.append('password', password);
  
      const configLogin = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://eoffice.ilcs.co.id',
          'Referer': 'https://eoffice.ilcs.co.id/p2b/login',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        // withCredentials: true
      }
      const url = "https://eoffice.ilcs.co.id/p2b/login/do_login"
      const login = await axios.post(url, params, configLogin)
  
      let mappingCookie = login.headers["set-cookie"][0]?.split(';')[0]
      mappingCookie += '; ' + login.headers["set-cookie"][1]?.split(';')[0]
      mappingCookie += '; ' + login.headers["set-cookie"][2]?.split(';')[0]
      console.log('Login success')
  
      const urlabsen = "https://eoffice.ilcs.co.id/p2b/absensi/absen_masuk"
      const data = `via=${latar}&kondisi=Sehat&lokasi=${latitude}%2C${longitude}&alamat=${alamat}&state=&provinsi=Special+capital+Region+of+Jakarta&keterangan=`
      const configAbsen = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://eoffice.ilcs.co.id',
          'Referer': 'https://eoffice.ilcs.co.id/p2b/absensi/online',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Cookie': mappingCookie,
        },
        withCredentials: true
      }
      const result = await axios.post(urlabsen, data, configAbsen)
      console.log(result.data, "Absen masuk result")
      console.log('Absen masuk success')
  
    } catch (error) {
      console.log(error)
    }
  // })
}

async function absenPulang(username, password, activity = "-", location, latar, delayPlusMinute = 0) {
  // return new Promise(async (resolve, reject) => {
    try {
      const minute = delayPlusMinute/1000/60; 
      await new Promise(resolve => setTimeout(() => resolve(console.log(minute, "Delay exectued")), delayPlusMinute))
      const latitude = location?.split(';')[0] || '-6.149751593365433';  
      const longitude = location?.split(';')[1] || '106.88824671984855';
      const alamat = location?.split(';')[2] || 'Jalan+Mitra+Sunter+Boulevard%2C+RW+11%2C+Sunter+Jaya%2C+Tanjung+Priok%2C+North+Jakarta%2C+Special+capital+Region+of+Jakarta%2C+Java%2C+14350%2C+Indonesia';
      const params = new URLSearchParams()
      params.append('username', username);
      params.append('password', password);
  
      const configLogin = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://eoffice.ilcs.co.id',
          'Referer': 'https://eoffice.ilcs.co.id/p2b/login',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        // withCredentials: true
      }
      const url = "https://eoffice.ilcs.co.id/p2b/login/do_login"
      const login = await axios.post(url, params, configLogin)
  
      let mappingCookie = login.headers["set-cookie"][0]?.split(';')[0]
      mappingCookie += '; ' + login.headers["set-cookie"][1]?.split(';')[0]
      mappingCookie += '; ' + login.headers["set-cookie"][2]?.split(';')[0]
      console.log('Login success')
  
      const urlabsen = "https://eoffice.ilcs.co.id/p2b/absensi/absen_pulang"
      const data = `via=${latar}&kondisi=Sehat&lokasi=${latitude}%2C${longitude}&alamat=${alamat}&state=&provinsi=Special+capital+Region+of+Jakarta&keterangan=&aktivitas=${activity}`
      const configAbsen = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://eoffice.ilcs.co.id',
          'Referer': 'https://eoffice.ilcs.co.id/p2b/absensi/online',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Cookie': mappingCookie,
        },
        withCredentials: true
      }
      const result = await axios.post(urlabsen, data, configAbsen)
      console.log(result.data, "Absen pulang result")
      console.log('Absen pulang sukses')
    } catch (error) {
      console.log(error)
    }
  // })
}

async function executeAbsenMasuk(username, password, location, latar) {
  try {
    console.log(`[INFO] - Start Absen Masuk - ${username}`, new Date().toLocaleString());
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--deterministic-fetch',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
        // '--single-process',
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://eoffice.ilcs.co.id', ['geolocation']);
  
    const page = await browser.newPage();
    const timeout = 500000;
    page.setDefaultTimeout(timeout);
    const latitude = location?.split(';')[0] || '-6.149751593365433';  
    const longitude = location?.split(';')[1] || '106.88824671984855';
    await page.setGeolocation({ latitude: Number(latitude), longitude: Number(longitude) });
    // await page.setGeolocation({ latitude: -6.149751593365433, longitude: 106.88824671984855 });
    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 915,
            height: 788
        })
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        startWaitingForEvents();
        await targetPage.goto('https://eoffice.ilcs.co.id/p2b/login');
        await Promise.all(promises);
    }
    {
      const targetPage = page;
      await puppeteer.Locator.race([
          targetPage.locator('::-p-xpath(//*[@id=\\"modal-banner\\"]/div/div/div[1]/button/span)'),
          targetPage.locator('::-p-text(×)')
      ])
          .setTimeout(timeout)
          .click({
            offset: {
              x: 7.1796875,
              y: 13,
            },
          });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[1]/input)')
        ])
            .setTimeout(timeout)
            .fill(username);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[2]/div/input[1])')
        ])
            .setTimeout(timeout)
            .fill(password);
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[3]/button)'),
            targetPage.locator('::-p-text(Sign In)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 248.5,
                y: 12.3046875,
              },
            });
        await Promise.all(promises);
    }
    console.log("[INFO] - KLIK ABSEN MASUK")
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"btnAbsenMasuk\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 110.3984375,
                y: 22.8046875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"via\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 351.5,
                y: 25,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"via\\"])')
        ])
            .setTimeout(timeout)
            .fill(latar);
    }
    console.log(`[INFO] - ${latar}`)
    console.log("[INFO] - WAITING MODAL MASUK 20s", new Date().toLocaleString())
    await new Promise(res => setTimeout(res, 20000))
    console.log("[INFO] - DONE MODAL MASUK", new Date().toLocaleString())
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"modalMasuk\\"]/div/div/div[3]/button[2])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 22.921875,
                y: 2,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"modalMasuk\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 759,
                y: 703,
              },
            });
    }
    console.log("[INFO] - MODAL MASUK")
    console.log("[INFO] - WAITING 50s", new Date().toLocaleString())
    await new Promise(res => setTimeout(res, 50000))
    console.log("[INFO] - DONE WAITING 50s", new Date().toLocaleString())
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria( Logout)'),
            targetPage.locator('ul.ml-auto a'),
            targetPage.locator('::-p-xpath(/html/body/div/nav/ul[2]/li/a)'),
            targetPage.locator(':scope >>> ul.ml-auto a'),
            targetPage.locator('::-p-text(Logout)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 24.8828125,
                y: 12.5,
              },
            });
        await Promise.all(promises);
    }
    console.log("[INFO] - LOG OUT")

    await browser.close();
    console.log("[INFO] - Finish Absen Masuk", new Date().toLocaleString());
    return true;
    // res.status(200).json({
    //   msg: "success",
    // })
  } catch (error) {
    console.error(error);
    process.exit(1)  
  }
}

async function executeAbsenPulang(username, password, activity, location, latar) {
  try {
    console.log(`[INFO] - Start Absen Pulang - ${username}, activity: ${activity}`, new Date().toLocaleString());
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--deterministic-fetch',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
        // '--single-process',
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://eoffice.ilcs.co.id', ['geolocation']);

    const timeout = 500000;
    page.setDefaultTimeout(timeout);
    const latitude = location?.split(';')[0] || '-6.149751593365433';  
    const longitude = location?.split(';')[1] || '106.88824671984855';
    await page.setGeolocation({ latitude: Number(latitude), longitude: Number(longitude) });
    // await page.setGeolocation({ latitude: -6.149751593365433, longitude: 106.88824671984855 });
    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 915,
            height: 788
        })
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        startWaitingForEvents();
        await targetPage.goto('https://eoffice.ilcs.co.id/p2b/login');
        await Promise.all(promises);
    }
    {
      const targetPage = page;
      await puppeteer.Locator.race([
          targetPage.locator('::-p-xpath(//*[@id=\\"modal-banner\\"]/div/div/div[1]/button/span)'),
          targetPage.locator('::-p-text(×)')
      ])
          .setTimeout(timeout)
          .click({
            offset: {
              x: 7.1796875,
              y: 13,
            },
          });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[1]/input)')
        ])
            .setTimeout(timeout)
            .fill(username);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[2]/div/input[1])')
        ])
            .setTimeout(timeout)
            .fill(password);
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/div[2]/div/form/div[3]/button)'),
            targetPage.locator('::-p-text(Sign In)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 178.5,
                y: 41.3046875,
              },
            });
        await Promise.all(promises);
    }
    console.log("[INFO] - KLIK ABSEN PULANG")
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"btnAbsenPulang\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 76.6953125,
                y: 26.8046875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"via_out\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 266.5,
                y: 20,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"via_out\\"])')
        ])
            .setTimeout(timeout)
            .fill(latar);
    }
    console.log(`[INFO] - ${latar}`)
    console.log("[INFO] - WAITING MODAL PULANG 20s", new Date().toLocaleString())
    await new Promise(res => setTimeout(res, 20000))
    console.log("[INFO] - DONE MODAL PULANG", new Date().toLocaleString())
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"aktivitas\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 182.5,
                y: 17,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"aktivitas\\"])')
        ])
            .setTimeout(timeout)
            .fill(activity);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"modalKeluar\\"]/div/div/div[3]/button[2])')
        ])
            .setTimeout(timeout)
            .click({
              delay: 584.5,
              offset: {
                x: 45.921875,
                y: 25,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(//*[@id=\\"modalKeluar\\"])')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 821,
                y: 352,
              },
            });
    }
    console.log("[INFO] - MODAL PULANG")
    console.log("[INFO] - WAITING 50s", new Date().toLocaleString())
    await new Promise(res => setTimeout(res, 50000))
    console.log("[INFO] - DONE WAITING 50s", new Date().toLocaleString())
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-xpath(/html/body/div/nav/ul[2]/li/a)'),
            targetPage.locator('::-p-text(Logout)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 19.8828125,
                y: 11.5,
              },
            });
        await Promise.all(promises);
    }
    console.log("[INFO] - LOG OUT")
    await browser.close();
    console.log("[INFO] - Finish Absen Pulang", new Date().toLocaleString());
    return true;
    // res.status(200).json({
    //   msg: "success",
    // })
  } catch (error) {
    console.error(error);
    process.exit(1)  
  }
}

function randomActivities(activities =[]) {
  try {
    const getRandomNumber = Math.floor(Math.random()*activities?.length);
    return activities[getRandomNumber]
  } catch (error) {
    console.log(error) 
  }
}

async function getAktivitas(username) {
  try {
    const { rows } = await db.query(`SELECT activity_name FROM activities a inner join config_activity ca on a.activity_id = ca.activity_id where ca.username = '${username}'`);
    return rows.map(row => row.activity_name)
  } catch (error) {
    console.log(error) 
  }
}
module.exports = { absen }


