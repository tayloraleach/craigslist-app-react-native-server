const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

async function getListing (url) {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(url)

  const content = await page.content()

  const $ = cheerio.load(content)
  const contentBody = $('#postingbody').html()

  let schema = null
  try {
    schema = $('#ld_posting_data').html()
  } catch (e) {
    console.log(e)
  }

  console.log(schema, '===')

//   await browser.close()

  return {
    contentBody,
    schema,
  }
}

module.exports.getListing = getListing
