import type { RsvpStatus } from '#shared/events'
import type { EventRsvp } from '#shared/types'
import { LazyAppDialog } from '#components'

/** Status changes and delete for one event's registrations; refreshes the `event-<id>-rsvps` fetch after each. */
export function useEventRsvpActions(eventId: MaybeRefOrGetter<string>) {
  const deleteConfirm = useOverlay().create(LazyAppDialog)
  const toast = useToast()
  const pending = ref<RsvpStatus | 'delete' | null>(null)

  const base = () => `/api/office/events/${toValue(eventId)}/rsvps`
  const refresh = () => refreshNuxtData(`event-${toValue(eventId)}-rsvps`)

  async function run(action: RsvpStatus | 'delete', title: string, fn: () => Promise<unknown>) {
    pending.value = action
    try {
      await fn()
      await refresh()
      return true
    }
    catch (err) {
      const e = err as { data?: { statusMessage?: string }, message?: string }
      toast.add({ icon: 'ph:x-circle', title, description: e.data?.statusMessage ?? e.message ?? 'Something went wrong', color: 'error' })
      return false
    }
    finally {
      pending.value = null
    }
  }

  function setStatus(rsvp: EventRsvp, status: RsvpStatus) {
    return run(status, 'Update failed', () => $fetch(`${base()}/${rsvp.id}`, { method: 'PATCH', body: { status } }))
  }

  async function remove(rsvp: EventRsvp) {
    const confirmed = await deleteConfirm.open({
      title: 'Delete registration',
      description: `This will permanently delete ${rsvp.fullName}'s registration (${rsvp.regId}) and its receipt. This cannot be undone.`,
      confirmLabel: 'Delete',
      color: 'error',
    })
    return confirmed ? run('delete', 'Delete failed', () => $fetch(`${base()}/${rsvp.id}`, { method: 'DELETE' })) : false
  }

  return { setStatus, remove, pending }
}
