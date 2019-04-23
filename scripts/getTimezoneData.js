const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const unzipper = require('unzipper')
const csv = require('csvtojson')
const moment = require('moment-timezone')

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
const DOWNLOAD_URL = 'https://timezonedb.com/files/timezonedb.csv.zip'

const OUTPUT_PATH = path.resolve(__dirname, '../src/data')
const TMP_FILE_PATH = path.resolve(__dirname, './tmp-timezone-data')

const setupFolderStructure = async () => {
  await fs.remove(OUTPUT_PATH)
  await fs.ensureDir(OUTPUT_PATH)

  // eslint-disable-next-line no-console
  console.log(`Setup directory at: ${OUTPUT_PATH}`)
}

const downloadZip = () => new Promise(resolve => {
  request({
    method: 'GET',
    url: DOWNLOAD_URL,
    headers: {
      'User-Agent': USER_AGENT
    }
  })
    .pipe(fs.createWriteStream(TMP_FILE_PATH + '.zip'))
    .on('close', resolve)
})

const unzip = () => new Promise(resolve => {
  fs
    .createReadStream(TMP_FILE_PATH + '.zip')
    .pipe(unzipper.Extract({
      path: TMP_FILE_PATH
    }))
    .on('finish', resolve)
})

const clean = async () => {
  await fs.remove(TMP_FILE_PATH)
  await fs.remove(TMP_FILE_PATH + '.zip')
}

const convertFile = async ({
  inputFileName,
  outputFileName,
  headers,
  keyGetter,
  valueGetter
}) => {
  const data = await csv({
    noheader: true,
    headers
  })
    .fromFile(path.resolve(TMP_FILE_PATH, inputFileName))

  const formatttedData = data
    .reduce((output, entity) => {
      output[keyGetter(entity)] = valueGetter(entity)
      return output
    }, {})

  fs.writeFileSync(path.resolve(OUTPUT_PATH, outputFileName), JSON.stringify(formatttedData, null, 2))
}

const createTimezonesFile = async () => {
  const timezones = moment.tz.names().reduce((output, zoneName) => {
    const tz = moment.tz(zoneName)

    output[zoneName] = {
      id: zoneName,
      name: zoneName.replace(/_/g, ' '),
      offset: 'UTC' + tz.format('Z'),
      nOffset: tz.utcOffset()
    }

    return output
  }, {})

  fs.writeFileSync(path.resolve(OUTPUT_PATH, 'timezones.json'), JSON.stringify(timezones, null, 2))
}

const doJob = async () => {
  await setupFolderStructure()
  await downloadZip()
  await unzip()

  await convertFile({
    inputFileName: 'zone.csv',
    outputFileName: 'zoneToCC.json',
    headers: ['id', 'cca2', 'name'],
    keyGetter: entity => entity.name,
    valueGetter: entity => entity.cca2
  })

  await convertFile({
    inputFileName: 'country.csv',
    outputFileName: 'CCToCountryName.json',
    headers: ['cca2', 'name'],
    keyGetter: entity => entity.cca2,
    valueGetter: entity => entity.name
  })

  await createTimezonesFile()

  await clean()
}

doJob()
