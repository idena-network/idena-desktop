import {Text} from '../atoms'
import theme from '../../../theme'

const Figure = ({label, value}) => (
  <div>
    <label>{label}</label>
    <Text>{value}</Text>
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

export const NetProfile = () => (
  <div>
    <Figure label="Status" value="Validated" />
    <Figure label="Stake" value="Validated" />
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
