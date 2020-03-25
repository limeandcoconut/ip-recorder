const fs = require('fs').promises

const ipPath = './ip-address.txt'
const templatePath = './template/haproxy.cfg'
const configPath = './config/haproxy.cfg'

;(async () => {
  const ip = await fs.readFile(ipPath, { encoding: 'utf8' })
  let config = await fs.readFile(templatePath, { encoding: 'utf8' })
  config = config.replace(/(server proxy )[\d.]{7,15}(:3535 check # Replace target)/, `$1${ip}$2`)
  await await fs.writeFile(configPath, config)
  console.log('Done\r\n')
})()
