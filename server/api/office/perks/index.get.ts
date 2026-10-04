import { campaign, channel, donor, perkClaim } from '@nuxthub/db/schema'
import { desc, eq, getTableColumns } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const claims = await db
    .select({
      ...getTableColumns(perkClaim),
      donorName: donor.name,
      donorHandle: donor.handle,
      donorEmail: donor.email,
      campaignTitle: campaign.title,
      channelType: channel.type,
    })
    .from(perkClaim)
    .innerJoin(donor, eq(donor.id, perkClaim.donorId))
    .innerJoin(campaign, eq(campaign.id, perkClaim.campaignId))
    .leftJoin(channel, eq(channel.id, perkClaim.channelId))
    .orderBy(desc(perkClaim.createdAt))

  return { claims, unclaimed: await getUnclaimedPerks() }
})
