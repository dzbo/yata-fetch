import { IFileOptions } from 'nconf'
import yata from './yata'
import log from './log'

const nconf = require('nconf')

export default async function () {
  // read argv for potential custom config path
  nconf.argv()

  // read ENV for token
  nconf.env()

  // load config path
  nconf.file({ file: yata.getConfigPath(nconf.get('config')) } as IFileOptions)

  // setup API host
  yata.apiHost = nconf.get('YATA_API_HOST') || 'https://api.yatapp.net'

  try {
    if (
      yata.validateConfig(
        nconf.get(nconf.get('token')),
        nconf.get('project'),
        nconf.get('locales'),
        nconf.get('format'),
        nconf.get('root'),
        nconf.get('outputPath'),
        nconf.get('strip_empty')
      )
    ) {
      // if passed locale explicit download just one
      if (nconf.get('locale')) {
        await yata.downloadTranslation(nconf.get('locale'))
      } else {
        for (const locale of yata.locales) {
          await yata.downloadTranslation(locale)
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      log('red', error.message)
    } else if (typeof error === 'string') {
      log('red', error)
    }
  }
}
