import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  SubHeading,
  Button,
  FormGroup,
  Label,
  Input,
} from '../../../shared/components'
import Avatar from './contact-avatar'

export function NewContactForm({name, lastName, addr, username, onSave}) {
  const nameRef = useRef(null)
  const lastNameRef = useRef(null)
  const addrRef = useRef(null)
  const usernameRef = useRef(null)
  return (
    <Box p="2em">
      <Avatar name="optimusway" size={4} />
      <SubHeading>Personal data</SubHeading>
      <FormGroup>
        <Label htmlFor="name">Name</Label>
        <Input defaultValue={name} ref={nameRef} id="name" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="lastName">Last Name</Label>
        <Input defaultValue={lastName} ref={lastNameRef} id="lastName" />
      </FormGroup>
      <SubHeading>Idena data</SubHeading>
      <FormGroup>
        <Label htmlFor="addr">Address</Label>
        <Input defaultValue={addr} ref={addrRef} id="addr" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="username">Username</Label>
        <Input defaultValue={username} ref={usernameRef} id="username" />
      </FormGroup>
      <Button
        onClick={() => {
          onSave({
            name: nameRef.current.value,
            lastName: lastNameRef.current.value,
            addr: addrRef.current.value,
            username: usernameRef.current.value,
          })
        }}
      >
        Save contact
      </Button>
    </Box>
  )
}

NewContactForm.propTypes = {
  name: PropTypes.string,
  lastName: PropTypes.string,
  addr: PropTypes.string,
  username: PropTypes.string,
  onSave: PropTypes.func.isRequired,
}

export default NewContactForm
