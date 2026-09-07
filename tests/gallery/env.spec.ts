import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadRootEnv, parseEnvLine } from '../../scripts/gallery/lib/env'

describe('parseEnvLine', () => {
  it('parses unquoted KEY=VALUE', () => {
    expect(parseEnvLine('FOO=bar')).toEqual({ key: 'FOO', value: 'bar' })
  })

  it('parses double-quoted values preserving spaces', () => {
    expect(parseEnvLine('GALLERY_SOURCE_DIR="/path with spaces/folder"')).toEqual({
      key: 'GALLERY_SOURCE_DIR',
      value: '/path with spaces/folder'
    })
  })

  it('parses single-quoted values', () => {
    expect(parseEnvLine("SOURCE_DIR='/home/user/photos'")).toEqual({
      key: 'SOURCE_DIR',
      value: '/home/user/photos'
    })
  })

  it('ignores comments and empty lines', () => {
    expect(parseEnvLine('# This is a comment')).toBeNull()
    expect(parseEnvLine('')).toBeNull()
    expect(parseEnvLine('   ')).toBeNull()
  })

  it('strips inline trailing comments for unquoted values', () => {
    expect(parseEnvLine('KEY=value # comment here')).toEqual({ key: 'KEY', value: 'value' })
  })

  it('handles export prefix', () => {
    expect(parseEnvLine('export DIR=/my/dir')).toEqual({ key: 'DIR', value: '/my/dir' })
  })
})

describe('loadRootEnv', () => {
  let tmpDir: string
  let envFile: string
  const originalEnv = { ...process.env }

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-env-test-'))
    envFile = path.join(tmpDir, '.env')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    process.env = { ...originalEnv }
  })

  it('populates process.env from specified file', () => {
    fs.writeFileSync(envFile, 'TEST_GALLERY_KEY="test-value"\n')
    delete process.env.TEST_GALLERY_KEY

    loadRootEnv(envFile)
    expect(process.env.TEST_GALLERY_KEY).toBe('test-value')
  })

  it('does not overwrite existing environment variables', () => {
    fs.writeFileSync(envFile, 'PREEXISTING_KEY="from-file"\n')
    process.env.PREEXISTING_KEY = 'from-shell'

    loadRootEnv(envFile)
    expect(process.env.PREEXISTING_KEY).toBe('from-shell')
  })
})
