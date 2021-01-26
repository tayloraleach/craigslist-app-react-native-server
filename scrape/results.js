const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const { PUPPETEER_ARGS } = require('./args')

async function getResults (url) {
  let results = []

  const browser = await puppeteer.launch(PUPPETEER_ARGS)
  const page = await browser.newPage()
  await page.goto(url)

  const content = await page.content()

  const $ = cheerio.load(content)
  const rows = $('li.result-row')

  rows.each((index, element) => {
    const result = $(element)
    const title = result.find('.result-title').text()
    const id = result.attr('data-pid')
    const price = $(result.find('.result-price').get(0)).text()
    const imageData = result.find('a.result-image').attr('data-ids')
    const datePosted = $(result.find('.result-date')).attr('datetime')
    const isOutOfArea = $(result.find('.nearby')).attr('title')
    let images = []
    if (imageData) {
      const parts = imageData.split(',')
      images = parts.map(id => {
        return `https://images.craigslist.org/${id.split(':')[1]}_300x300.jpg`
      })
    }

    let hood = result.find('.result-hood').text()

    if (hood) {
      // javascript truthy, falsy
      hood = hood.match(/\((.*)\)/)[1]
      //.trim().replace("(", "").replace(")", "");
    }

    // .result-title.hdrlnk
    let url = result.find('.result-title.hdrlnk').attr('href')

    results.push({
      title,
      id,
      price,
      images,
      hood,
      url,
      isOutOfArea,
      datePosted
    })
  })

  await browser.close()

  return results
}

module.exports.getResults = getResults
