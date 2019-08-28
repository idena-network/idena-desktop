const config = {
  exportPathMap() {
    // Let Next.js know where to find the entry page
    // when it's exporting the static bundle for the use
    // in the production version of your app
    return {
      '/dashboard': {page: '/dashboard'},
      '/contacts': {page: '/contacts'},
      '/contacts/invite': {page: '/contacts/new-invite'},
      '/chats': {page: '/chats'},
      '/wallets': {page: '/wallets'},
      '/flips': {page: '/flips'},
      '/flips/new': {page: '/flips/new'},
      '/flips/edit': {page: '/flips/edit'},
      '/validation/short': {page: '/validation/short'},
      '/validation/long': {page: '/validation/long'},
    }
  },
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 10,
  },
}

module.exports = config
