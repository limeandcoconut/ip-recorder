const fs = require('fs').promises
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const templatePath = './template/haproxy.cfg'
const configPath = './config/haproxy.cfg'

module.exports = async (ip) => {
  let config = await fs.readFile(templatePath, { encoding: 'utf8' })
  config = config.replace(/(server proxy )[\d.]{7,15}(:3535 check # Replace target)/, `$1${ip}$2`)
  await await fs.writeFile(configPath, config)
  await exec('sudo docker kill --signal USR2 $(docker container ls --filter name=haproxy-proxy --quiet)')
}
