import {Text} from '../atoms'
import theme from '../../../theme'

const Figure = ({label, value, postfix = ''}) => (
  <div>
    <label>{label}</label>
    <Text wrap>{value}</Text> {postfix && <Text>{postfix}</Text>}
    <style jsx>{`
      div {
        margin: 0 0 1em;
      }

      label {
        color: ${theme.colors.muted};
        display: block;
        margin-bottom: 0.5em;
      }
    `}</style>
  </div>
)

export const NetProfile = ({addr, balance}) => (
  <div>
    <Figure label="Address" value={addr} />
    <Figure label="Status" value="Validated" />
    <Figure label="Stake" value={balance.stake} postfix="DNA" />
    <Figure label="Balance" value={balance.balance} postfix="DNA" />
    <Figure label="Age" value="24 epochs" />
    <Figure label="Next validation" value={new Date().toLocaleString()} />
    <style jsx>{`
      div {
        background: rgb(245, 246, 247);
        border-radius: 4px;
        padding: 2em;
      }
    `}</style>
  </div>
)
