export function createStore ({ saveFile, wallets = {} }: { saveFile: Function, wallets?: object }) {
  return {
    getWalletIDs () {
      return Object.keys(wallets)
    },
    async save () {
      // TODO
      await saveFile()
    }
  }
}
