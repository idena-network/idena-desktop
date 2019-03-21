import {SubHeading, Text} from '../atoms'

export const UserInfo = ({user}) => (
  <div>
    <div>
      <img src="https://github.com/optimusway.png" />
    </div>
    <div>
      <SubHeading>{user.name}</SubHeading>
      <Text color="gray">{user.address}</Text>
    </div>
    <style jsx>{`
      div {
        display: flex;
        align-items: center;
      }
      div div {
        display: block;
      }
      img {
        border-radius: 10px;
        width: 96px;
        margin-right: 1em;
      }
    `}</style>
  </div>
)
