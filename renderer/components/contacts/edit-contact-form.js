import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {Box, Button, FormGroup, Label, Input} from '../../shared/components'
import Avatar from './contact-avatar'

export function EditContactForm({name, lastName, addr, onSave}) {
  const nameRef = useRef(null)
  const lastNameRef = useRef(null)
  const addrRef = useRef(null)
  return (
    <Box p="2em">
      <Avatar name="optimusway" size={4} />
      <FormGroup>
        <Label htmlFor="name">Name</Label>
        <Input defaultValue={name} ref={nameRef} id="name" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="lastName">Last Name</Label>
        <Input defaultValue={lastName} ref={lastNameRef} id="lastName" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="addr">Address</Label>
        <Input defaultValue={addr} ref={addrRef} id="addr" />
      </FormGroup>
      <Button
        onClick={() => {
          onSave({
            name: nameRef.current.value,
            lastName: lastNameRef.current.value,
            addr: addrRef.current.value,
          })
        }}
      >
        Done
      </Button>
    </Box>
  )
}

EditContactForm.propTypes = {
  name: PropTypes.string,
  lastName: PropTypes.string,
  addr: PropTypes.string,
  onSave: PropTypes.func.isRequired,
}

export default EditContactForm
