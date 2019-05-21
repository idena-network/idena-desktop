const withCSS = require('@zeit/next-css')

const config = {
  publicRuntimeConfig: {
    baseUrl: process.env.BASE_URL,
  },
  exportPathMap() {
    // Let Next.js know where to find the entry page
    // when it's exporting the static bundle for the use
    // in the production version of your app
    return {
      '/start': {page: '/start'},
      '/contacts': {page: '/contacts'},
      '/contacts/new': {page: '/contacts/new'},
      '/contacts/edit': {page: '/contacts/edit'},
      '/contacts/view': {page: '/contacts/view'},
      '/chats': {page: '/chats'},
      '/wallets': {page: '/wallets'},
      '/dashboard': {page: '/dashboard'},
      '/flips': {page: '/flips'},
      '/validation': {page: '/validation'},
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

module.exports = withCSS(config)
