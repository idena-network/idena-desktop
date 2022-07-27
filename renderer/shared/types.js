export const IdentityStatus = {
  Undefined: 'Undefined',
  Invite: 'Invite',
  Candidate: 'Candidate',
  Newbie: 'Newbie',
  Verified: 'Verified',
  Suspended: 'Suspended',
  Zombie: 'Zombie',
  Terminating: 'Terminating',
  Human: 'Human',
}

export const EpochPeriod = {
  FlipLottery: 'FlipLottery',
  ShortSession: 'ShortSession',
  LongSession: 'LongSession',
  AfterLongSession: 'AfterLongSession',
  None: 'None',
}

export const AnswerType = {
  None: 0,
  Left: 1,
  Right: 2,
  Inappropriate: 3,
}

export const SessionType = {
  Short: 'short',
  Long: 'long',
  Qualification: 'qualification',
}

export const FlipType = {
  Publishing: 'publishing',
  Published: 'published',
  Draft: 'draft',
  Archived: 'archived',
  Deleting: 'deleting',
  Invalid: 'invalid',
}

export const FlipFilter = {
  Active: 'active',
  Draft: 'draft',
  Archived: 'archived',
}

export const VotingStatus = {
  Pending: 'pending',
  Open: 'open',
  Voted: 'voted',
  Counting: 'counting',
  CanBeProlonged: 'canbeprolonged',
  Archived: 'archive',
  Terminated: 'terminated',
  Deploying: 'deploying',
  Funding: 'funding',
  Starting: 'starting',
  Voting: 'voting',
  Finishing: 'finishing',
  Prolonging: 'prolonging',
  Terminating: 'terminating',
  Invalid: 'invalid',
}

export const VoteOption = {
  Confirm: 'confirm',
  Reject: 'reject',
}

export const OnboardingStep = {
  ActivateInvite: 'activateInvite',
  Validate: 'validate',
  CreateFlips: 'createFlips',
  FlipLottery: 'flipLottery',
  WaitingValidationResults: 'waitingValidationResults',
  ActivateMining: 'activateMining',
}

export const NodeType = {
  Miner: 'miner',
  Delegator: 'delegator',
}

export const RelevanceType = {
  Abstained: 0,
  Relevant: 1,
  Irrelevant: 2,
}

export const FlipGrade = {
  None: 0,
  Reported: 1,
  GradeD: 2,
  GradeC: 3,
  GradeB: 4,
  GradeA: 5,
}

export const TxType = {
  SendTx: 0x0,
  ActivationTx: 0x1,
  InviteTx: 0x2,
  KillTx: 0x3,
  SubmitFlipTx: 0x4,
  SubmitAnswersHashTx: 0x5,
  SubmitShortAnswersTx: 0x6,
  SubmitLongAnswersTx: 0x7,
  EvidenceTx: 0x8,
  OnlineStatusTx: 0x9,
  KillInviteeTx: 0xa,
  ChangeGodAddressTx: 0xb,
  BurnTx: 0xc,
  ChangeProfileTx: 0xd,
  DeleteFlipTx: 0xe,
  DeployContractTx: 0xf,
  CallContractTx: 0x10,
  TerminateContractTx: 0x11,
  DelegateTx: 0x12,
  UndelegateTx: 0x13,
  KillDelegatorTx: 0x14,
  StoreToIpfsTx: 0x15,
  ReplenishStakeTx: 0x16,
}
