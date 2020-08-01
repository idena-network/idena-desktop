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
  All: 'all',
  Open: 'open',
  Voted: 'voted',
  Counting: 'counting',
  Archive: 'archive',
  Mining: 'mining',
}

export const FactAction = {
  Confirm: 'confirm',
  Reject: 'reject',
}
