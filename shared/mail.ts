export const MAIL_DOMAIN = 'luckytinfs.com'

/** Aliases on the @luckytinfs.com domain, used to pick a `from` per flow */
export const MAIL_ADDRESSES = {
  noReply: 'no-reply@luckytinfs.com',
  inquiry: 'inquiry@luckytinfs.com',
  admin: 'admin@luckytinfs.com',
  donations: 'donations@luckytinfs.com',
  events: 'events@luckytinfs.com',
} as const
