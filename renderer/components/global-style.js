import React from 'react'

export default () => (
  <style jsx global>{`
    html {
      box-sizing: border-box;
      font-size: 14px;
      min-height: 100%;
    }
    body {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial,
        sans-serif;
      font-size: 1rem;
      margin: 0;
      padding: 0;
      min-height: 100%;
    }
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
    body > div,
    main {
      min-height: 100%;
    }
  `}</style>
)
