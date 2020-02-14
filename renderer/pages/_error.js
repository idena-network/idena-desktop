import React from 'react'
import Error from 'next/error'
import {rem, margin} from 'polished'
import {useTranslation} from 'react-i18next'
import Layout from '../shared/components/layout'
import {Button} from '../shared/components'
import theme from '../shared/theme'

// make ssr happy
global.logger = global.logger || {
  error() {},
}

// eslint-disable-next-line react/prop-types
function MyError({statusCode, hasGetInitialPropsRun, err}) {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/zeit/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    global.logger.error(err)
  }

  const {t} = useTranslation()

  return (
    <Layout>
      <article>
        <div>{t('Something went wrong')}</div>
        <div>
          <section>
            <h2>
              {statusCode
                ? `An error ${statusCode} occurred on server`
                : t('An error occurred on client')}
            </h2>
            <div>
              <Button onClick={() => global.ipcRenderer.send('reload')}>
                {t('Go to My Idena')}
              </Button>
            </div>
          </section>
        </div>
        <style jsx>{`
          article {
            background: rgb(69, 72, 77);
            color: white;
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-height: 100vh;
          }
          div:first-child {
            background: rgb(255, 102, 102);
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: ${rem(20, 13)};
            padding: ${rem(12, 13)};
            position: relative;
            text-align: center;
          }
          div:nth-child(2) {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
          h2 {
            font-size: ${rem(18, theme.fontSizes.base)};
            font-weight: 500;
            margin: ${margin(0, 0, rem(40, theme.fontSizes.base))};
            word-break: break-all;
          }
          section > div:nth-child(2) > section {
            background: rgb(255, 102, 102);
            border-radius: ${rem(9, theme.fontSizes.base)};
            font-size: ${rem(14, 13)};
            line-height: ${rem(20, 13)};
            margin-top: ${rem(40, theme.fontSizes.base)};
            padding: ${rem(18, theme.fontSizes.base)}
              ${rem(24, theme.fontSizes.base)};
            max-width: ${rem(480, theme.fontSizes.base)};
          }
        `}</style>
      </article>
    </Layout>
  )
}

MyError.getInitialProps = async ({res, err, asPath}) => {
  const errorInitialProps = await Error.getInitialProps({res, err})

  // Workaround for https://github.com/zeit/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true

  if (res) {
    // Running on the server, the response object is available.
    //
    // Next.js will pass an err on the server if a page's `getInitialProps`
    // threw or returned a Promise that rejected

    if (res.statusCode === 404) {
      // Opinionated: do not record an exception in Sentry for 404
      return {statusCode: 404}
    }

    if (err) {
      global.logger.error(err)

      return errorInitialProps
    }
  } else {
    // Running on the client (browser).
    //
    // Next.js will provide an err if:
    //
    //  - a page's `getInitialProps` threw or returned a Promise that rejected
    //  - an exception was thrown somewhere in the React lifecycle (render,
    //    componentDidMount, etc) that was caught by Next.js's React Error
    //    Boundary. Read more about what types of exceptions are caught by Error
    //    Boundaries: https://reactjs.org/docs/error-boundaries.html
    // eslint-disable-next-line no-lonely-if
    if (err) {
      global.logger.error(err)

      return errorInitialProps
    }
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  global.logger.error(
    `_error.js getInitialProps missing data at path: ${asPath}`
  )

  return errorInitialProps
}

export default MyError
