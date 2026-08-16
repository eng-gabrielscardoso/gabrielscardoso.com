/**
 * Small Ethereum helpers for the support button. MetaMask is the only wallet we talk to,
 * and we talk to it through the injected EIP-1193 provider — no extra SDK.
 */

export const ETH_MAINNET_CHAIN_ID = '0x1'
export const ETH_DONATION_PRESETS = ['0.001', '0.005', '0.01', '0.05'] as const
export const ETH_DEFAULT_AMOUNT = '0.001'
export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'

export const PROVIDER_USER_REJECTED = 4001
export const PROVIDER_CHAIN_NOT_ADDED = 4902

const WEI_DECIMALS = 18n

export interface EthereumProvider {
  isMetaMask?: boolean
  providers?: EthereumProvider[]
  request(args: { method: string; params?: unknown }): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
}

const ETH_MAINNET_ADD_CHAIN = {
  chainId: ETH_MAINNET_CHAIN_ID,
  chainName: 'Ethereum Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://ethereum-rpc.publicnode.com'],
  blockExplorerUrls: ['https://etherscan.io'],
}

export function getProviderErrorCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'number') {
    return error.code
  }
  return undefined
}

export function isUserRejected(error: unknown): boolean {
  return getProviderErrorCode(error) === PROVIDER_USER_REJECTED
}

export function shortenAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function parseEtherToHex(amount: string): `0x${string}` {
  const trimmed = amount.trim()
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed)) {
    throw new Error('Invalid ETH amount')
  }

  const [wholeRaw = '0', fractionRaw = ''] = trimmed.split('.')
  if (fractionRaw.length > 18) {
    throw new Error('ETH amount has too many decimals')
  }

  const wei = BigInt(wholeRaw) * 10n ** WEI_DECIMALS + BigInt(fractionRaw.padEnd(18, '0'))
  if (wei <= 0n) {
    throw new Error('ETH amount must be greater than zero')
  }

  return `0x${wei.toString(16)}`
}

export function isValidEthAmount(amount: string): boolean {
  try {
    parseEtherToHex(amount)
    return true
  } catch {
    return false
  }
}

export function getInjectedProvider(): EthereumProvider | undefined {
  const ethereum = (globalThis as { ethereum?: EthereumProvider }).ethereum
  if (!ethereum) return undefined
  if (Array.isArray(ethereum.providers)) {
    return ethereum.providers.find((provider) => provider.isMetaMask) ?? ethereum.providers[0]
  }
  return ethereum
}

export async function requestAccount(provider: EthereumProvider): Promise<string> {
  const accounts = await provider.request({ method: 'eth_requestAccounts' })
  if (!Array.isArray(accounts) || typeof accounts[0] !== 'string' || !accounts[0]) {
    throw new Error('No account returned')
  }
  return accounts[0]
}

export async function ensureEthereumMainnet(provider: EthereumProvider): Promise<void> {
  const chainId = await provider.request({ method: 'eth_chainId' })
  if (chainId === ETH_MAINNET_CHAIN_ID) return

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ETH_MAINNET_CHAIN_ID }],
    })
  } catch (error) {
    if (getProviderErrorCode(error) !== PROVIDER_CHAIN_NOT_ADDED) throw error
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [ETH_MAINNET_ADD_CHAIN],
    })
  }
}

export async function sendEthTransaction(
  provider: EthereumProvider,
  input: { from: string; to: string; amountEth: string },
): Promise<string> {
  await ensureEthereumMainnet(provider)

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: input.from,
        to: input.to,
        value: parseEtherToHex(input.amountEth),
      },
    ],
  })

  if (typeof hash !== 'string' || !hash.startsWith('0x')) {
    throw new Error('Wallet did not return a transaction hash')
  }

  return hash
}
