import log from './log'

import { IncomingMessage } from 'http'
const https = require('https')
const path = require('path')
const fs = require('fs')

type Locale = string
type Format = 'yml' | 'json'

export default {
  config: null,
  defaultConfigPath: './yata.json',
  configPath: '',
  token: '',
  project: '',
  locales: [] as string[],
  format: 'yml',
  root: false,
  outputPath: 'translations',
  stripEmpty: false,
  apiHost: '',

  getConfigPath(configPath: string) {
    if (configPath) {
      this.configPath = configPath
    } else {
      this.configPath = this.defaultConfigPath
    }

    return this.configPath
  },

  validateConfig(
    token?: string,
    project?: string,
    locales?: Locale[],
    format?: Format,
    root?: boolean,
    outputPath?: string,
    stripEmpty?: boolean
  ) {
    if (!token) {
      throw new Error('No `token` in ENV')
    } else {
      this.token = token
    }

    if (!project) {
      throw new Error('No `project` in config file')
    } else {
      this.project = project
    }

    if (!Array.isArray(locales) || locales.length === 0) {
      throw new Error('No `locales` in config file')
    } else {
      this.locales = locales
    }

    if (format && typeof format === 'string') {
      this.format = format
    }

    if (root && typeof root === 'boolean') {
      this.root = root
    }

    if (outputPath && typeof outputPath === 'string') {
      this.outputPath = outputPath
    }

    if (stripEmpty && typeof stripEmpty === 'boolean') {
      this.stripEmpty = stripEmpty
    }

    return true
  },

  normalizeLocale(locale: Locale) {
    if (!locale) {
      return
    }

    const localeSegments = locale.replace('-', '_').split('_')
    const newLocale = []
    newLocale.push(localeSegments[0].toLowerCase())

    // two segment locale
    if (localeSegments[1]) {
      newLocale.push(localeSegments[1].toUpperCase())
    }

    return newLocale.join('_')
  },

  downloadTranslation(locale: Locale) {
    const normalizedLocale = this.normalizeLocale(locale)

    if (!normalizedLocale) {
      throw new Error('No locale passed to download function')
    }

    // if output folder doesn't exist we create it
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath)
    }

    const fileName = `${normalizedLocale}.${this.format}`
    const filePath = path.join(process.cwd(), `${this.outputPath}/${fileName}`)
    const url = `${this.apiHost}/api/v1/project/${this.project}/${locale}/${this.format}?apiToken=${this.token}&root=${this.root}&strip_empty=${this.stripEmpty}`

    let bufferFile: Buffer

    // if file exist we grab it's size
    if (fs.existsSync(filePath)) {
      bufferFile = fs.readFileSync(filePath)
    }

    // we start stream
    const file = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
      https
        .get(url, (response: IncomingMessage) => {
          const { statusCode } = response

          if (statusCode !== 200) {
            return reject(`Request Failed.\nStatus Code: ${statusCode}`)
          }

          response.pipe(file)
          file.on('finish', () => {
            const newBufferFile = fs.readFileSync(filePath)

            if (bufferFile && bufferFile.equals(newBufferFile)) {
              log('yellow', `Generating "${locale}" translation. Skipped.`)
            } else {
              log('green', `Generating "${locale}" translation. Done.`)
            }
            resolve(true)
          })
        })
        .on('error', (error: Error) => {
          if (error instanceof Error) {
            log('red', error.message)
          } else if (typeof error === 'string') {
            log('red', error)
          }
        })
    })
  },
}
