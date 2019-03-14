import Nav from './nav'
import createStore from '../../store'

const {user} = createStore()

export const Layout = ({NavMenu = Nav, children}) => (
  <main>
    <NavMenu user={user} />
    <div>{children}</div>
    <style jsx>{`
      main {
        display: flex;
        padding: 0;
        margin: 0;
        height: 100%;
      }
    `}</style>
  </main>
)
