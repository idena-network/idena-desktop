export const VotingListFilter = {
  Todo: 'todo',
  Voting: 'voting',
  Closed: 'closed',
  All: 'all',
  Own: 'own',
}

export const wrapUnexpectedTxType = type => `Unexpected tx type: ${type}`

export const ContractTransactionType = {
  CallContract: 'Call contract',
  TerminateContract: 'Terminate voting',
  DeployContract: 'Create voting',
  SendTx: 'Send',

  ActivationTx: wrapUnexpectedTxType('ActivationTx'),
  InviteTx: wrapUnexpectedTxType('InviteTx'),
  KillTx: wrapUnexpectedTxType('KillTx'),
  SubmitFlipTx: wrapUnexpectedTxType('SubmitFlipTx'),
  SubmitAnswersHashTx: wrapUnexpectedTxType('SubmitAnswersHashTx'),
  SubmitShortAnswersTx: wrapUnexpectedTxType('SubmitShortAnswersTx'),
  SubmitLongAnswersTx: wrapUnexpectedTxType('SubmitLongAnswersTx'),
  EvidenceTx: wrapUnexpectedTxType('EvidenceTx'),
  OnlineStatusTx: wrapUnexpectedTxType('OnlineStatusTx'),
  KillInviteeTx: wrapUnexpectedTxType('KillInviteeTx'),
  ChangeGodAddressTx: wrapUnexpectedTxType('ChangeGodAddressTx'),
  BurnTx: wrapUnexpectedTxType('BurnTx'),
  ChangeProfileTx: wrapUnexpectedTxType('ChangeProfileTx'),
  DeleteFlipTx: wrapUnexpectedTxType('DeleteFlipTx'),
}

export const ContractCallMethod = {
  Start: 'Start voting',
  Vote: 'Vote',
  VoteProof: 'Vote (secret)',
  Prolong: 'Prolong voting',
  Finish: 'Finish voting',
  AddStake: 'Add stake',
}

export const ContractRpcMode = {
  Estimate: 'estimate',
  Call: 'call',
}
