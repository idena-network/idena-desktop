import Nav from './nav'
import createStore from '../../store'
import GlobalStyle from '../../global-style'

const {user} = createStore()

export const Layout = ({NavMenu = Nav, children}) => (
  <>
    <GlobalStyle />
    <main>
      <NavMenu user={user} />
      <div>{children}</div>
      <style jsx>{`
        main {
          display: flex;
          height: 100%;
          padding: 0;
          margin: 0;
        }

        div {
          width: 100%;
        }
      `}</style>
    </main>
  </>
)
