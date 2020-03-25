const express = require('express')
const cors = require('cors')
const argon2 = require('argon2')
const { port } = require('./config.js')
const fs = require('fs').promises

const reloadHAProxy = require('./reload-haproxy.js')
const hashedRecord = require('./password-hashes.js')

const filePath = './ip-address.txt'
const app = express()
let ip

app.use(cors({
  methods: ['POST', 'GET'],
  origin: true,
}))

app.use(express.json())

app.get('/', async (request, response) => {
  if (!ip) {
    response.status(500)
    return response.send('IP address uninitialized')
  }
  response.status(200)
  return response.send(ip)
})

app.post('/', async (request, response) => {
  if (!request.body.secret || !await argon2.verify(hashedRecord, request.body.secret)) {
    response.status(401)
    return response.send('Unauthorized')
  }
  ip = request.body.ip
  await fs.writeFile(filePath, ip)
  await reloadHAProxy(ip)

  response.status(200)
  return response.send('Received')
})

;(async () => {
  try {
    ip = await fs.readFile(filePath, { encoding: 'utf8' })
  } catch (error) {
    console.log(error)
  }
  app.listen(port, () => console.log(`Listening on: ${port}`))
})()
