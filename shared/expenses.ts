import { z } from 'zod'

/** API body for creating/updating an expense. channelId null = paid in cash */
export const expenseSchema = z.object({
  title: z.string().trim().min(1),
  amount: z.number().int().positive(), // cents
  spentAt: z.coerce.date(),
  channelId: z.string().min(1).nullable(),
  campaignId: z.string().min(1).nullable(),
  eventId: z.string().min(1).nullable(),
  receiptUrl: z.string().optional(),
  notes: z.string().trim().optional(),
  isPublic: z.boolean().optional(),
})

export interface OfficeExpense {
  id: string
  title: string
  amount: number
  spentAt: string
  campaignId: string | null
  campaignTitle: string | null
  eventId: string | null
  eventName: string | null
  channelId: string | null
  channelLabel: string | null
  receiptUrl: string | null
  notes: string | null
  isPublic: boolean
  createdByName: string | null
}
