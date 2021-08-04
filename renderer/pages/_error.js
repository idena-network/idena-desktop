import React from 'react'
import Error from 'next/error'
import {useTranslation} from 'react-i18next'
import {Box, Flex, Heading, Stack} from '@chakra-ui/core'
import {Page} from '../screens/app/components'
import {FillCenter} from '../screens/oracles/components'
import Layout from '../shared/components/layout'
import {PrimaryButton} from '../shared/components/button'

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
      <Page p={0}>
        <Flex
          bg="graphite.500"
          color="white"
          direction="column"
          flex={1}
          w="full"
        >
          <Box bg="red.500" p={3} textAlign="center">
            {t('Something went wrong')}
          </Box>
          <FillCenter>
            <Stack align="center">
              <Heading fontSize="lg" fontWeight={500}>
                {statusCode
                  ? `An error ${statusCode} occurred on server`
                  : t('An error occurred on client')}
              </Heading>
              <Box>
                <PrimaryButton
                  onClick={() => global.ipcRenderer.send('reload')}
                >
                  {t('Go to My Idena')}
                </PrimaryButton>
              </Box>
            </Stack>
          </FillCenter>
        </Flex>
      </Page>
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
