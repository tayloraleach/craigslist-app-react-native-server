const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const {getResults} = require('./scrape/results')
const {getListing} = require('./scrape/listing')

const app = express()

app.use(cors())

app.use(morgan('tiny'))

app.get('/', (request, response) => {
  response.json({
    message: 'Pass some params!',
  })
})

// Single listing.
app.get('/listing', async (request, response) => {
  const {url} = request.query
  console.log(url)
  const data = await getListing(url)
  response.json({
    url,
    data,
  })
})

// Search Results.
app.get('/search', async (request, response) => {
  const {
    location,
    searchTerm,
    postedToday,
    searchTitlesOnly,
    hasImages,
    category,
    ownerType,
    minPrice,
    maxPrice,
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
  if (!isNaN(minPrice)) {
    url += `&min_price=${minPrice}`
  }
  if (!isNaN(maxPrice)) {
    url += `&max_price=${maxPrice}`
  }

  console.log(encodeURI(url), '======', request.query)

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
