import {Layout} from '../components/layout'
import Link from 'next/link'

export default () => (
  <Layout>
    <h1>Chats</h1>
    <Link href="/contacts">{'<< Home'}</Link>
  </Layout>
)
