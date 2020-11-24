const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

async function getListing (url) {

  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(url)

  const content = await page.content()

  const $ = cheerio.load(content)
    const contentBody = $('#postingbody').html();

  //   rows.each((index, element) => {
  //     const result = $(element)
  //     const title = result.find('.result-title').text()
  //     const id = result.attr('data-pid')
  //     const price = $(result.find('.result-price').get(0)).text()
  //     const imageData = result.find('a.result-image').attr('data-ids')
  //     let images = []
  //     if (imageData) {
  //       const parts = imageData.split(',')
  //       images = parts.map(id => {
  //         return `https://images.craigslist.org/${id.split(':')[1]}_300x300.jpg`
  //       })
  //     }

  //     let hood = result.find('.result-hood').text()

  //     if (hood) {
  //       // javascript truthy, falsy
  //       hood = hood.match(/\((.*)\)/)[1]
  //       //.trim().replace("(", "").replace(")", "");
  //     }

  //     // .result-title.hdrlnk
  //     let url = result.find('.result-title.hdrlnk').attr('href')

  //     results.push({
  //       title,
  //       id,
  //       price,
  //       images,
  //       hood,
  //       url,
  //     })
  //   })

  await browser.close()

  return {
    contentBody
  }
}

module.exports.getListing = getListing
