import type { DonationStatus } from '#shared/donations'
import { campaign, channel, donation, donor } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { user } from '#auth/schema'
import { DONATION_STATUSES } from '#shared/donations'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)
  const statusRaw = typeof query.status === 'string' ? query.status : ''

  if (statusRaw && !DONATION_STATUSES.includes(statusRaw as DonationStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const rows = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      display: donation.display,
      refNo: donation.refNo,
      proofUrl: donation.proofUrl,
      status: donation.status,
      donorNotes: donation.donorNotes,
      adminNotes: donation.adminNotes,
      reviewedBy: donation.reviewedBy,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      donorId: donor.id,
      donorName: donor.name,
      donorHandle: donor.handle,
      donorSocial: donor.social,
      donorEmail: donor.email,
      campaignId: donation.campaignId,
      campaignTitle: campaign.title,
      channelId: donation.channelId,
      channelType: channel.type,
      channelNickname: channel.nickname,
      reviewerName: user.name,
    })
    .from(donation)
    .innerJoin(donor, eq(donor.id, donation.donorId))
    .leftJoin(campaign, eq(campaign.id, donation.campaignId))
    .innerJoin(channel, eq(channel.id, donation.channelId))
    .leftJoin(user, eq(user.id, donation.reviewedBy))
    .where(statusRaw ? eq(donation.status, statusRaw) : undefined)
    .orderBy(desc(donation.createdAt))

  return {
    donations: rows.map(({ donorId, donorName, donorHandle, donorSocial, donorEmail, campaignTitle, channelType, channelNickname, reviewedBy, reviewerName, ...row }) => ({
      ...row,
      donor: { id: donorId, name: donorName, handle: donorHandle, social: donorSocial, email: donorEmail },
      campaignTitle,
      channelLabel: channelNickname || channelType,
      reviewedBy,
      reviewer: reviewedBy && reviewerName ? { id: reviewedBy, name: reviewerName } : null,
    })),
  }
})
