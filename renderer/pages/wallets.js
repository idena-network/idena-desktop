import {Layout} from '../components/layout'
import Link from 'next/link'

export default () => (
  <Layout>
    <h1>Wallets</h1>
    <Link href="/start">{'<< Home'}</Link>
  </Layout>
)
