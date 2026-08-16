import {
  getInjectedProvider,
  requestAccount,
  sendEthTransaction,
  type EthereumProvider,
} from '#shared/ethereum'

export function useMetaMask() {
  const account = ref<string | null>(null)
  const hasWallet = ref(false)
  const pending = ref<'connect' | 'send' | null>(null)

  let listening: EthereumProvider | undefined

  function refresh() {
    hasWallet.value = Boolean(getInjectedProvider())
  }

  function onAccountsChanged(accounts: unknown) {
    const list = Array.isArray(accounts) ? accounts : []
    account.value = typeof list[0] === 'string' ? list[0] : null
  }

  function listen(provider: EthereumProvider) {
    if (listening === provider) return
    listening?.removeListener?.('accountsChanged', onAccountsChanged)
    provider.on?.('accountsChanged', onAccountsChanged)
    listening = provider
  }

  async function connect() {
    const provider = getInjectedProvider()
    if (!provider) {
      hasWallet.value = false
      throw new Error('NO_WALLET')
    }

    pending.value = 'connect'
    try {
      account.value = await requestAccount(provider)
      listen(provider)
      hasWallet.value = true
      return account.value
    } finally {
      pending.value = null
    }
  }

  async function send(to: string, amountEth: string) {
    const provider = getInjectedProvider()
    if (!provider) {
      hasWallet.value = false
      throw new Error('NO_WALLET')
    }

    pending.value = 'send'
    try {
      const from = account.value ?? (await requestAccount(provider))
      account.value = from
      listen(provider)
      hasWallet.value = true
      return await sendEthTransaction(provider, { from, to, amountEth })
    } finally {
      pending.value = null
    }
  }

  onMounted(refresh)
  onUnmounted(() => {
    listening?.removeListener?.('accountsChanged', onAccountsChanged)
  })

  return { account, hasWallet, pending, connect, send, refresh }
}
