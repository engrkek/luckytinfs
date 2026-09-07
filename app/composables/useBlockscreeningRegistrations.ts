export interface BlockscreeningRegistration {
  id: string
  fullName: string
  nickname: string
  email: string
  mobile: string
  primaryPlatform: string
  primaryUsername: string
  otherPlatform: string
  otherUsername: string
  childRegistration: string
  minorName: string
  relationship: string
  paid: boolean
  paymentReference: string | null
  paymentMode: string | null
  paymentReceiver: string | null
  paymentAmount?: number | null
  hasPaymentEntry?: boolean
  createdAt: string
}

interface BlockscreeningRegistrationsResponse {
  registrations: BlockscreeningRegistration[]
}

function errorMessage(err: any, fallback: string) {
  return err?.data?.statusMessage || err?.message || fallback
}

/**
 * Passcode-gated registrations list for the block screening admin console.
 * Not a pinia-colada query: access here is a single shared passcode entered at
 * runtime (see useBlockscreeningAuth), not a cookie session, so the fetch is
 * gated by isAuthorized rather than auto-run on mount.
 */
export function useBlockscreeningRegistrations() {
  const { password, rememberPassword } = useBlockscreeningAuth()

  const registrations = ref<BlockscreeningRegistration[]>([])
  const isPending = ref(true)
  const isCheckingAuth = ref(true)
  const isAuthorized = ref(false)
  const error = ref('')
  const loginError = ref('')

  async function fetchRegistrations(enteredPassword?: string) {
    isPending.value = true
    error.value = ''
    loginError.value = ''

    const pwd = enteredPassword ?? password.value

    try {
      const data = await $fetch<BlockscreeningRegistrationsResponse>('/api/blockscreening/registrations', {
        headers: { 'X-Admin-Password': pwd },
      })
      registrations.value = data.registrations
      isAuthorized.value = true
      rememberPassword(pwd)
    }
    catch (err: any) {
      if (err.status === 401) {
        isAuthorized.value = false
        if (enteredPassword) {
          loginError.value = 'Incorrect admin passcode. Please try again.'
        }
      }
      else {
        error.value = errorMessage(err, 'An unexpected error occurred while loading registrations.')
      }
    }
    finally {
      isPending.value = false
      isCheckingAuth.value = false
    }
  }

  return {
    registrations,
    isPending,
    isCheckingAuth,
    isAuthorized,
    error,
    loginError,
    fetchRegistrations,
  }
}

/** Toggle a registration's paid status, with optimistic update + rollback on error. */
export const useToggleBlockscreeningPaid = defineMutation(() => {
  const toast = useBlockscreeningToast()

  return useMutation({
    mutation: ({ registration, paid }: { registration: BlockscreeningRegistration, paid: boolean }) =>
      $fetch('/api/blockscreening/paid', {
        method: 'POST',
        headers: useBlockscreeningAuth().adminHeaders(),
        body: { id: registration.id, paid },
      }),

    onMutate({ registration, paid }) {
      const previous = registration.paid
      registration.paid = paid
      return { previous }
    },

    onError(err, { registration }, { previous }) {
      registration.paid = previous
      toast.show(errorMessage(err, 'Failed to update payment status.'), 'error')
    },

    onSuccess(_data, { registration, paid }) {
      toast.show(`Updated payment status for ${registration.fullName} to: ${paid ? 'PAID' : 'UNPAID'}`, 'success')
    },
  })
})

const SEAT_OPTION_LABELS: Record<string, string> = {
  sponsor: 'Sponsor 1 child 🐥',
  sponsor_two: 'Sponsor 2 children 🐥🐥',
  bring: 'Bring own child 🎒',
}

/** Update a registration's child seat option, with optimistic update + rollback on error. */
export const useUpdateBlockscreeningSeatOption = defineMutation(() => {
  const toast = useBlockscreeningToast()

  return useMutation({
    mutation: ({ registration, childRegistration }: { registration: BlockscreeningRegistration, childRegistration: string }) =>
      $fetch('/api/blockscreening/seat-option', {
        method: 'POST',
        headers: useBlockscreeningAuth().adminHeaders(),
        body: { id: registration.id, childRegistration },
      }),

    onMutate({ registration, childRegistration }) {
      const previous = registration.childRegistration
      registration.childRegistration = childRegistration
      return { previous }
    },

    onError(err, { registration }, { previous }) {
      registration.childRegistration = previous
      toast.show(errorMessage(err, 'Failed to update seat option.'), 'error')
    },

    onSuccess(_data, { registration, childRegistration }) {
      toast.show(`Updated seat option for ${registration.fullName} to: ${SEAT_OPTION_LABELS[childRegistration] || childRegistration}`, 'success')
    },
  })
})

/** Update who received a registration's payment, with optimistic update + rollback on error. */
export const useUpdateBlockscreeningPaymentReceiver = defineMutation(() => {
  const toast = useBlockscreeningToast()

  return useMutation({
    mutation: ({ registration, paymentReceiver }: { registration: BlockscreeningRegistration, paymentReceiver: string | null }) =>
      $fetch('/api/blockscreening/payment-receiver', {
        method: 'POST',
        headers: useBlockscreeningAuth().adminHeaders(),
        body: { id: registration.id, paymentReceiver: paymentReceiver || null },
      }),

    onMutate({ registration, paymentReceiver }) {
      const previous = registration.paymentReceiver
      registration.paymentReceiver = paymentReceiver || null
      return { previous }
    },

    onError(err, { registration }, { previous }) {
      registration.paymentReceiver = previous
      toast.show(errorMessage(err, 'Failed to update payment receiver.'), 'error')
    },

    onSuccess(_data, { registration, paymentReceiver }) {
      toast.show(`Updated payment receiver for ${registration.fullName} to: ${paymentReceiver || 'None'}`, 'success')
    },
  })
})

/** Send the payment-instructions email; blocked once already paid (matches the button's disabled state). */
export const useSendBlockscreeningPaymentEmail = defineMutation(() => {
  const toast = useBlockscreeningToast()

  return useMutation({
    mutation: (registration: BlockscreeningRegistration) =>
      $fetch('/api/blockscreening/send-payment-email', {
        method: 'POST',
        headers: useBlockscreeningAuth().adminHeaders(),
        body: { id: registration.id, email: registration.email, nickname: registration.nickname, fullName: registration.fullName },
      }),

    onError(err) {
      toast.show(errorMessage(err, 'Failed to send email to attendee.'), 'error')
    },

    onSuccess(_data, registration) {
      toast.show(`Payment instructions email dispatched to ${registration.email}!`, 'success')
    },
  })
})

/** Send the verified payment confirmation & admission pass email; blocked unless already marked PAID. */
export const useSendBlockscreeningConfirmationEmail = defineMutation(() => {
  const toast = useBlockscreeningToast()

  return useMutation({
    mutation: (registration: BlockscreeningRegistration) =>
      $fetch('/api/blockscreening/send-confirmation-email', {
        method: 'POST',
        headers: useBlockscreeningAuth().adminHeaders(),
        body: {
          id: registration.id,
          email: registration.email,
          fullName: registration.fullName,
          nickname: registration.nickname,
          childRegistration: registration.childRegistration,
          minorName: registration.minorName,
          relationship: registration.relationship,
        },
      }),

    onError(err) {
      toast.show(errorMessage(err, 'Failed to send confirmation email.'), 'error')
    },

    onSuccess(_data, registration) {
      toast.show(`Payment confirmation pass dispatched to ${registration.email}!`, 'success')
    },
  })
})
