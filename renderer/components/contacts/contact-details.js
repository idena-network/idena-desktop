import {UserInfo} from '../dashboard/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../theme'
import {Figure} from '../atoms'

export default ({fullName, address, status, age}) => {
  return (
    <div>
      <UserInfo user={{name: fullName, address: address}} />
      <ContactToolbar />
      <div>
        <Figure label="Status" value={status} />
        <Figure label="Age" value={age} postfix="epochs" />
        <Figure label="Address" value={address} />
      </div>
      <style jsx>{`
        div {
          padding: 4em 3em;
        }
        div > div {
          background: ${theme.colors.gray};
          border-radius: 4px;
          padding: 2em;
        }
      `}</style>
    </div>
  )
}
