import React from 'react'
import {useRouter} from 'next/router'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'

// eslint-disable-next-line react/prop-types
export default function Layout({children}) {
  const {pathname} = useRouter()
  return (
    <main>
      <Sidebar />
      <section>
        {!pathname.startsWith('/validation') && <ValidationBanner />}
        {children}
      </section>
      <Notifications />
      <style jsx>{`
        main {
          display: flex;
          padding: 0;
          margin: 0;
          max-height: 100vh;
          overflow: hidden;
        }
        section {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </main>
  )
}
