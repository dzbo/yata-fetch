#!/usr/bin/env node

// This file stays JS: Node executes it directly via shebang, so it cannot be
// TypeScript without a build step in front of the binary. It is ESM (the
// package sets "type": "module"), importing the CJS build via default interop.
/** @type {(argv?: string[], env?: NodeJS.ProcessEnv) => Promise<number>} */
import cli from '../dist/cli.cjs'

void cli()
