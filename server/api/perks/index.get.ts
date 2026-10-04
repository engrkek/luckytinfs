/** What the public perks page needs: the donor's earned perks and where their claim is at. */
export default defineEventHandler(async (event) => {
  const { donor: donorId, campaign: campaignId } = await getValidatedQuery(event, perkKey.parse)
  const { donor, campaign, tiers, sizes, claim } = await getPerkContext(donorId, campaignId)

  return {
    name: donor.name === 'Anonymous' ? donor.handle : donor.name,
    project: campaign.title,
    tiers: tiers.map(({ name, items }) => ({ name, items })),
    sizes,
    claim: claim
      ? {
          recipientName: claim.recipientName,
          phone: claim.phone,
          address: claim.address,
          courier: claim.courier,
          size: claim.size,
          notes: claim.notes,
          shippingFee: claim.shippingFee,
          status: claim.status,
          trackingNo: claim.trackingNo,
        }
      : null,
  }
})
