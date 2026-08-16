import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
import { UApp } from '#components'
import SupportButton from '~/components/SupportButton.vue'
import type { EthereumProvider } from '#shared/ethereum'

const Harness = defineComponent({
  setup() {
    return () => h(UApp, null, { default: () => h(SupportButton) })
  },
})

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>

let wrapper: Wrapper | undefined

function stubEthereum(request: EthereumProvider['request']) {
  const provider = { isMetaMask: true, request, on: vi.fn(), removeListener: vi.fn() }
  ;(globalThis as { ethereum?: typeof provider }).ethereum = provider
  ;(window as { ethereum?: typeof provider }).ethereum = provider
}

function dialogText() {
  const dialogs = document.querySelectorAll('[role="dialog"]')
  return dialogs[dialogs.length - 1]?.textContent ?? ''
}

function findDialogButton(label: string) {
  const dialogs = document.querySelectorAll('[role="dialog"]')
  const dialog = dialogs[dialogs.length - 1]
  if (!dialog) return undefined
  return Array.from(dialog.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(label),
  )
}

async function openSupport(current: Wrapper) {
  await current.get('button').trigger('click')
  await expect.poll(() => dialogText()).toContain('Bitcoin')
}

async function expandEthereum() {
  findDialogButton('Ethereum')?.click()
  await expect.poll(() => dialogText()).toContain('Copy address')
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  delete (globalThis as { ethereum?: EthereumProvider }).ethereum
  delete (window as { ethereum?: EthereumProvider }).ethereum
  vi.restoreAllMocks()
})

describe('SupportButton', () => {
  it('opens the support modal with both donation rails', async () => {
    wrapper = await mountSuspended(Harness, { route: '/' })
    await openSupport(wrapper)

    expect(dialogText()).toContain('Bitcoin')
    expect(dialogText()).toContain('Ethereum')
  })

  it('offers MetaMask install when no wallet is injected', async () => {
    wrapper = await mountSuspended(Harness, { route: '/' })
    await openSupport(wrapper)
    await expandEthereum()

    expect(dialogText()).toContain('Install MetaMask')
    expect(dialogText()).toContain('Copy address')
  })

  it('connects MetaMask when a wallet is injected', async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') return ['0xabcabcabcabcabcabcabcabcabcabcabcabcabca']
      throw new Error(`unexpected ${method}`)
    })
    stubEthereum(request)

    wrapper = await mountSuspended(Harness, { route: '/' })
    await openSupport(wrapper)
    await expandEthereum()
    await expect.poll(() => dialogText()).toContain('Connect MetaMask')

    findDialogButton('Connect MetaMask')?.click()
    await expect.poll(() => request.mock.calls.length).toBeGreaterThan(0)

    expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
  })
})
