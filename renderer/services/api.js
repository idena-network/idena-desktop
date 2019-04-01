import {baseUrl} from '../api/setup'

export const fetchAddress = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'dna_getCoinbaseAddr', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const fetchBalance = address =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'dna_getBalance',
      params: [address],
      id: 1,
    }),
  })
    .then(response => response.json())
    .then(data => data.result)

export const getPeers = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'net_peers', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const getLastBlock = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'dna_lastBlock', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const submitFlip = hex =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'flip_submitFlip', params: [hex], id: 1}),
  })

export const fetchFlip = hash =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'flip_getFlip', params: [hash], id: 1}),
  }).then(r => r.json())

export const fetchContactList = () =>
  Promise.resolve([
    {
      fullName: 'Q',
      status: 'Validated',
      address: '0xb7fc5b9b34b8328460d79981abee1d278611fa1a',
      age: 1,
    },
    {
      fullName: 'QQ',
      status: 'Validated',
      address: '0xb7fc5b9b34b8328460d79981abee1d278611fa1a',
      age: 2,
    },
    {
      fullName: 'QQQ',
      status: 'Invited',
      address: '0xb7fc5b9b34b8328460d79981abee1d278611fa1a',
      age: 3,
    },
  ])

export const fetchChatList = () =>
  Promise.resolve([
    {
      sender: {fullName: 'Q'},
      messages: [
        {sender: 'Q', text: `hi! what's up`, timestamp: Date.now()},
        {
          sender: 'QQ',
          text: 'could you plz help me with flips',
          timestamp: Date.now(),
        },
        {sender: 'Q', text: 'for sure', timestamp: Date.now()},
        {sender: 'Q', text: 'what is your question', timestamp: Date.now()},
        {sender: 'QQ', text: 'how can i reverse flip', timestamp: Date.now()},
        {sender: 'Q', text: `you shouldn't`, timestamp: Date.now()},
        {sender: 'Q', text: 'there is a shuffle button', timestamp: Date.now()},
      ],
    },
    {
      sender: {fullName: 'QQ'},
      messages: [
        {sender: 'Q', text: 'hi there', timestamp: Date.now()},
        {sender: 'QQ', text: 'there we go', timestamp: Date.now()},
      ],
    },
    {
      sender: {fullName: 'QQQ'},
      messages: [
        {sender: 'Q', text: 'hi there', timestamp: Date.now()},
        {sender: 'QQ', text: 'there we go', timestamp: Date.now()},
      ],
    },
  ])
