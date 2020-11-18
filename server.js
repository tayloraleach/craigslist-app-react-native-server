const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

const app = express()

app.use(cors())

app.use(morgan('tiny'))

async function getResults (url) {
  let results = []

  const browser = await puppeteer.launch({headless: false})
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
    })
  })

  await browser.close()

  return results
}

app.get('/', (request, response) => {
  response.json({
    message: 'Pass some params!',
  })
})

app.get('/search', async (request, response) => {
  const {
    location,
    searchTerm,
    postedToday,
    searchTitlesOnly,
    hasImages,
    ownerType,
  } = request.query
  let ownerOrDealer = 'sss'
  if (ownerType === 'Dealer') {
    ownerOrDealer = 'ssq'
  }
  if (ownerType === 'Owner') {
    ownerOrDealer = 'sso'
  }
  let url = `https://${location}.craigslist.org/search/${ownerOrDealer}?sort=date&query=${searchTerm}`
  if (postedToday === 'true') {
    url += '&postedToday=1'
  }
  if (searchTitlesOnly === 'true') {
    url += '&srchType=T'
  }
  if (hasImages === 'true') {
    url += '&hasPic=1'
  }
  const results = await getResults(encodeURI(url))
  response.json(results)
})

app.use((request, response, next) => {
  const error = new Error('not found')
  response.status(404)
  next(error)
})

app.use((error, request, response, next) => {
  response.status(response.statusCode || 500)
  response.json({
    message: error.message,
  })
})

app.listen(5000, () => {
  console.log('Listening on port 5000')
})
