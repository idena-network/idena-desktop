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
}
