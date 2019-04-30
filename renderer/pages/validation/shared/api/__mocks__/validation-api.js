/* eslint-disable import/prefer-default-export */

export async function fetchFlipHashes() {
  return [
    {hash: 'QmP51EwjRttZqoJeMFBWkpJp6WdwmMKVYxgXuCF72SwGuC', ready: true},
    {hash: 'QmaKjmtokGABTGZxMBuxFwuL8jybihgkjRR7pX1ng5Ckd2', ready: false},
    {hash: 'QmVufGEfabnLGEHXDWTxu3YeuxifBYBhyLoutzJyhXvekj', ready: true},
    {hash: 'QmXnbULQSokNZoYBbPDiPNkJhC4ezGsaoYTfRNK5vX6eFK', ready: true},
    {hash: 'QmRacGdq6f2hj4H8A1hZkVQZ83MgHmsxKwfqn8QmWXiKyj', ready: true},
  ]
}

export async function fetchFlip(hash) {
  return {hash}
}

export async function submitShortAnswers(answers, nonce, epoch) {
  return answers
}

export async function submitLongAnswers(answers, nonce, epoch) {
  return answers
}
