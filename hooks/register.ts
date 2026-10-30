import type { EngineInterface, Register } from 'claude-code'

type Clip = 'ding' | 'phone'

// The engine's own player plays nothing in a Windows host, so there the clip
// goes through PowerShell's SoundPlayer; elsewhere through $.audio.play.
const isWindows = (root: string) => /^[A-Za-z]:[\\/]/.test(root)
const POWERSHELL = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'

// A permission card can be heard twice (PermissionRequest, then Notification):
// one ring per prompt.
const RING_DEDUPE_MS = 3000
let lastRingAt = 0

function play($: EngineInterface, clip: Clip) {
  const asset = `sounds/${clip}.wav`
  const fail = (why: string) => $.ui.log(`${$.plugin.name}: could not play ${clip}: ${why}`)
  if (!isWindows($.plugin.root)) {
    $.audio.play({ asset }).catch(err => fail(String(err)))
    return
  }
  const file = `${$.plugin.root}\\sounds\\${clip}.wav`.replace(/'/g, "''")
  $.process
    .run(
      [
        POWERSHELL,
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-Command',
        `(New-Object System.Media.SoundPlayer '${file}').PlaySync()`,
      ],
      { timeoutMs: 10_000 },
    )
    .then(r => {
      if (r.exitCode !== 0) fail(`exit ${r.exitCode}: ${r.stderr.slice(0, 300)}`)
    })
    .catch(err => fail(String(err)))
}

function ring($: EngineInterface) {
  const now = Date.now()
  if (now - lastRingAt < RING_DEDUPE_MS) return
  lastRingAt = now
  play($, 'phone')
}

export const register: Register = on => {
  // The main loop's turn ended: the answer is in, the prompt waits.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined && !e.isAborted) play($, 'ding')
    return done
  })

  // A permission card is about to wait on the person.
  on('classic.PermissionRequest', async ($, e, next) => {
    ring($)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('classic.Notification', async ($, e, next) => {
    if (e.notification_type === 'permission_prompt') ring($)
    return next(e)
  }).catch(($, e, next) => next(e))

  // Claude asks a question and waits for the answer.
  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    ring($)
    return next(e)
  }).catch(($, e, next) => next(e))
}
