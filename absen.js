const puppeteer = require('puppeteer');
const db = require('./config/db');

async function absen(type='masuk') {
  try {
    const users = await getDataUser();
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      if (type == 'masuk') await executeAbsenMasuk(user.username, user.password);
      else if (type =='keluar') await executeAbsenPulang(user.username, user.password);
      await new Promise(res => setTimeout(res, 4000));
    }
  } catch (error) {
    console.log(error);
  }
}
async function getDataUser() {
  try {
    const { rows } = await db.query('SELECT username, password FROM users');
    return rows
  } catch (error) {
    console.log(error)
  }
}

async function executeAbsenMasuk(username, password) {
  try {
    console.log(`[INFO] - Start Absen Masuk - ${username}`, new Date().toLocaleString());
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
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
    await page.setGeolocation({ latitude: -6.149751593365433, longitude: 106.88824671984855 });
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
            .fill('WFS');
    }
    console.log("[INFO] - WORK FROM SITE")
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

async function executeAbsenPulang(username, password) {
  try {
    console.log(`[INFO] - Start Absen Pulang - ${username}`, new Date().toLocaleString());
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
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
    await page.setGeolocation({ latitude: -6.149751593365433, longitude: 106.88824671984855 });
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
            .fill('WFS');
    }
    console.log("[INFO] - WORK FROM SITE")
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
            .fill('Fixing bugs, define development detail');
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

module.exports = {absen}


