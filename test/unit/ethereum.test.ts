import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ETH_MAINNET_CHAIN_ID,
  PROVIDER_CHAIN_NOT_ADDED,
  PROVIDER_USER_REJECTED,
  ensureEthereumMainnet,
  getInjectedProvider,
  isUserRejected,
  isValidEthAmount,
  parseEtherToHex,
  requestAccount,
  sendEthTransaction,
  shortenAddress,
  type EthereumProvider,
} from '#shared/ethereum'

function fakeProvider(
  handlers: Record<string, (params?: unknown) => unknown | Promise<unknown>>,
): EthereumProvider {
  return {
    isMetaMask: true,
    async request({ method, params }) {
      const handler = handlers[method]
      if (!handler) throw new Error(`unexpected method ${method}`)
      return handler(params)
    },
  }
}

afterEach(() => {
  delete (globalThis as { ethereum?: EthereumProvider }).ethereum
})

describe('parseEtherToHex', () => {
  it('converts whole ether to wei hex', () => {
    expect(parseEtherToHex('1')).toBe('0xde0b6b3a7640000')
  })

  it('converts fractional ether used by the donation presets', () => {
    expect(parseEtherToHex('0.001')).toBe('0x38d7ea4c68000')
    expect(parseEtherToHex('0.05')).toBe('0xb1a2bc2ec50000')
  })

  it('rejects zero, empty, and oversized decimals', () => {
    expect(isValidEthAmount('0')).toBe(false)
    expect(isValidEthAmount('')).toBe(false)
    expect(isValidEthAmount('-1')).toBe(false)
    expect(isValidEthAmount('0.0000000000000000001')).toBe(false)
    expect(isValidEthAmount('1.0')).toBe(true)
  })
})

describe('shortenAddress', () => {
  it('keeps the head and tail of an account', () => {
    expect(shortenAddress('0xddf0d86f79007b1ab2b545b710126edb546c498a')).toBe('0xddf0…498a')
  })
})

describe('getInjectedProvider', () => {
  it('prefers MetaMask when several injected wallets are present', () => {
    const metamask = fakeProvider({})
    const other = fakeProvider({})
    other.isMetaMask = false
    ;(globalThis as { ethereum?: EthereumProvider }).ethereum = {
      ...other,
      providers: [other, metamask],
    }

    expect(getInjectedProvider()).toBe(metamask)
  })
})

describe('wallet rpc', () => {
  it('returns the first connected account', async () => {
    const provider = fakeProvider({
      eth_requestAccounts: () => ['0xabc'],
    })

    expect(await requestAccount(provider)).toBe('0xabc')
  })

  it('switches to Ethereum mainnet when the wallet is elsewhere', async () => {
    const switchChain = vi.fn()
    const provider = fakeProvider({
      eth_chainId: () => '0x89',
      wallet_switchEthereumChain: (params) => switchChain(params),
    })

    await ensureEthereumMainnet(provider)

    expect(switchChain).toHaveBeenCalledWith([{ chainId: ETH_MAINNET_CHAIN_ID }])
  })

  it('adds Ethereum mainnet when the wallet does not know the chain', async () => {
    const addChain = vi.fn()
    const provider = fakeProvider({
      eth_chainId: () => '0x89',
      wallet_switchEthereumChain: () => {
        throw { code: PROVIDER_CHAIN_NOT_ADDED }
      },
      wallet_addEthereumChain: (params) => addChain(params),
    })

    await ensureEthereumMainnet(provider)

    expect(addChain).toHaveBeenCalled()
  })

  it('sends eth to the configured recipient after ensuring mainnet', async () => {
    const send = vi.fn(() => '0xhash')
    const provider = fakeProvider({
      eth_chainId: () => ETH_MAINNET_CHAIN_ID,
      eth_sendTransaction: (params) => send(params),
    })

    await expect(
      sendEthTransaction(provider, {
        from: '0xfrom',
        to: '0xddf0d86f79007b1ab2b545b710126edb546c498a',
        amountEth: '0.001',
      }),
    ).resolves.toBe('0xhash')

    expect(send).toHaveBeenCalledWith([
      {
        from: '0xfrom',
        to: '0xddf0d86f79007b1ab2b545b710126edb546c498a',
        value: '0x38d7ea4c68000',
      },
    ])
  })

  it('recognises a user-rejected request', () => {
    expect(isUserRejected({ code: PROVIDER_USER_REJECTED })).toBe(true)
    expect(isUserRejected({ code: 0 })).toBe(false)
  })
})
