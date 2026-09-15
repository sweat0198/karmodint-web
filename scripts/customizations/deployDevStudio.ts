import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { loadRootEnv } from '../catalogue/lib/sanityEnv'

const SANITY_STUDIO_HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.sanity\.studio$/

/** Refuses non-dev targets and hostnames that could redirect a Studio deployment elsewhere. */
export function resolveDevStudioDeployHost(environment: Record<string, string | undefined>): string {
  if (environment.SANITY_DATASET !== 'dev') {
    throw new Error(`Dev Studio deployment refuses dataset "${environment.SANITY_DATASET ?? '(missing)'}"; only "dev" is allowed`)
  }

  const hostname = environment.SANITY_STUDIO_DEV_HOST
  if (!hostname) throw new Error('Missing SANITY_STUDIO_DEV_HOST in the root .env')
  if (!SANITY_STUDIO_HOSTNAME.test(hostname)) {
    throw new Error('SANITY_STUDIO_DEV_HOST must be a .sanity.studio hostname without a protocol or path')
  }
  return hostname
}

export function buildDevStudioDeployCommand(hostname: string): string[] {
  return ['--prefix', 'sanity', 'run', 'deploy', '--', '--url', hostname]
}

async function runDevStudioDeploy(hostname: string): Promise<void> {
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn('npm', buildDevStudioDeployCommand(hostname), { stdio: 'inherit' })
    child.once('error', reject)
    child.once('close', (code) => resolve(code ?? 1))
  })
  if (exitCode !== 0) process.exitCode = exitCode
}

async function main(): Promise<void> {
  loadRootEnv()
  await runDevStudioDeploy(resolveDevStudioDeployHost(process.env))
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
