export type Color = 'red' | 'green' | 'yellow'

const CODES: Record<Color, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
}

const WHITE = '\x1b[37m'

export default function log(color: Color, message: string): void {
  console.log(`${CODES[color] ?? WHITE}%s\x1b[0m`, message)
}
