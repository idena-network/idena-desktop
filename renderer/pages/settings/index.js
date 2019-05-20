import React, {useState, useEffect} from 'react'

import Layout from '../../components/layout'
import {
  Box,
  Heading,
  SubHeading,
  Input,
  Label,
  Button,
  Text,
} from '../../shared/components'
import theme from '../../shared/theme'
import nodeSettings from '../../screens/settings/shared/utils/node'

export default function Settings() {
  const addrRef = React.createRef()

  const [addr, setAddr] = useState()
  const [saved, setSaved] = useState()

  const handleSaveNodeAddr = () => {
    const nextAddr = addrRef.current.value
    setAddr(nextAddr)
    setSaved(true)
  }

  useEffect(() => {
    if (addr) {
      nodeSettings.url = addr
    }
  }, [addr])

  return (
    <Layout>
      <Box padding={theme.spacings.normal}>
        <Heading>Settings</Heading>
        <Box>
          <SubHeading>Node settings</SubHeading>
          <Label>Address</Label>
          <Input defaultValue={nodeSettings.url} ref={addrRef} />
          <Button onClick={handleSaveNodeAddr}>Save</Button>
          {saved && (
            <Text color={theme.colors.success}>Now running against {addr}</Text>
          )}
        </Box>
      </Box>
    </Layout>
  )
}
