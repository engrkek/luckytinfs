import type { LetterDesign, LetterRecipient, LetterVisibility } from '#shared/letters/types'
import {
  LETTER_DEFAULTS,
  LETTER_LIMITS,
  LETTER_STICKERS,
} from '#shared/letters/assets'
import { normalizeSpotifyMusic } from '#shared/letters/spotify'

export type LetterStoryTool = 'paper' | 'font' | 'envelope' | 'seal' | 'sticker' | 'music' | null

export function useLetterEditor() {
  const recipient = ref<LetterRecipient | null>(null)
  const senderName = ref('')
  const senderEmail = ref('')
  const body = ref('')
  const visibility = ref<LetterVisibility>('public')

  const design = reactive<LetterDesign>({
    background: LETTER_DEFAULTS.background,
    font: LETTER_DEFAULTS.font,
    envelope: LETTER_DEFAULTS.envelope,
    seal: LETTER_DEFAULTS.seal,
    music: LETTER_DEFAULTS.music,
    stickers: [],
  })

  const activeTool = ref<LetterStoryTool>(null)
  const selectedSticker = ref<number | null>(null)
  const editingText = ref(false)
  const sendOpen = ref(false)

  const canSubmit = computed(() =>
    recipient.value !== null
    && body.value.trim().length > 0
    && body.value.trim().length <= LETTER_LIMITS.bodyMax,
  )

  function toggleTool(tool: NonNullable<LetterStoryTool>) {
    activeTool.value = activeTool.value === tool ? null : tool
    if (tool !== 'sticker')
      selectedSticker.value = null
    if (tool !== null)
      editingText.value = false
  }

  function closeTool() {
    activeTool.value = null
  }

  function addSticker(id?: string) {
    if (design.stickers.length >= LETTER_LIMITS.stickersMax)
      return

    const stickerId = id || LETTER_STICKERS[0]!.id
    // Slight scatter so stacked adds don't perfectly overlap
    const n = design.stickers.length
    const x = 50 + ((n % 5) - 2) * 8
    const y = 42 + ((n % 4) - 1.5) * 10

    design.stickers.push({
      id: stickerId,
      x: Math.min(90, Math.max(10, x)),
      y: Math.min(88, Math.max(12, y)),
      rotation: ((n % 5) - 2) * 8,
      scale: 1,
    })
    selectedSticker.value = design.stickers.length - 1
    activeTool.value = 'sticker'
  }

  function removeSticker(index: number) {
    design.stickers.splice(index, 1)
    if (selectedSticker.value === index)
      selectedSticker.value = null
    else if (selectedSticker.value != null && selectedSticker.value > index)
      selectedSticker.value--
  }

  function updateSticker(
    index: number,
    patch: Partial<{ x: number, y: number, rotation: number, scale: number }>,
  ) {
    const s = design.stickers[index]
    if (!s)
      return
    if (patch.x != null)
      s.x = Math.min(95, Math.max(5, patch.x))
    if (patch.y != null)
      s.y = Math.min(95, Math.max(5, patch.y))
    if (patch.rotation != null)
      s.rotation = patch.rotation
    if (patch.scale != null)
      s.scale = Math.min(3, Math.max(0.4, patch.scale))
  }

  function buildPayload() {
    if (!recipient.value)
      throw new Error('Recipient required')

    return {
      recipient: recipient.value,
      senderName: senderName.value.trim() || undefined,
      senderEmail: senderEmail.value.trim() || undefined,
      body: body.value.trim(),
      design: {
        background: design.background,
        font: design.font,
        envelope: design.envelope,
        seal: design.seal,
        ...((): { music?: string } => {
          const music = normalizeSpotifyMusic(design.music)
          return music ? { music } : {}
        })(),
        stickers: design.stickers.map(s => ({ ...s })),
      },
      visibility: visibility.value,
    }
  }

  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const submittedId = ref<string | null>(null)

  async function submit() {
    if (!canSubmit.value || submitting.value)
      return

    submitting.value = true
    submitError.value = null

    try {
      const created = await $fetch<{ id: string }>('/api/letters', {
        method: 'POST',
        body: buildPayload(),
      })
      submittedId.value = created.id
      sendOpen.value = false
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      submitError.value = err.data?.message || err.message || 'Could not send letter. Try again.'
    }
    finally {
      submitting.value = false
    }
  }

  function reset() {
    recipient.value = null
    senderName.value = ''
    senderEmail.value = ''
    body.value = ''
    visibility.value = 'public'
    design.background = LETTER_DEFAULTS.background
    design.font = LETTER_DEFAULTS.font
    design.envelope = LETTER_DEFAULTS.envelope
    design.seal = LETTER_DEFAULTS.seal
    design.music = LETTER_DEFAULTS.music
    design.stickers = []
    activeTool.value = null
    selectedSticker.value = null
    editingText.value = false
    sendOpen.value = false
    submitError.value = null
    submittedId.value = null
  }

  return {
    recipient,
    senderName,
    senderEmail,
    body,
    visibility,
    design,
    activeTool,
    selectedSticker,
    editingText,
    sendOpen,
    canSubmit,
    toggleTool,
    closeTool,
    addSticker,
    removeSticker,
    updateSticker,
    submit,
    submitting,
    submitError,
    submittedId,
    reset,
    limits: LETTER_LIMITS,
  }
}
