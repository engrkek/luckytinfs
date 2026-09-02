<script setup lang="ts">
import Compressor from 'compressorjs'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps<{ file: File }>()

const emit = defineEmits<{
  done: [pathname: string]
  cancel: []
}>()

const src = URL.createObjectURL(props.file)
onBeforeUnmount(() => URL.revokeObjectURL(src))

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)

function compress(input: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    void new Compressor(input, {
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
      mimeType: 'image/jpeg',
      success: resolve,
      error: reject,
    })
  })
}

async function confirm() {
  const canvas = cropperRef.value?.getResult().canvas
  if (!canvas || busy.value)
    return
  busy.value = true
  error.value = null
  try {
    const raw = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    )
    if (!raw)
      throw new Error('Could not read the crop')
    const photo = await compress(raw)
    const form = new FormData()
    form.append('photo', photo, 'postcard.jpg')
    const { pathname } = await $fetch<{ pathname: string }>('/api/letters/photo', {
      method: 'POST',
      body: form,
    })
    emit('done', pathname)
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    error.value = err.data?.message || err.message || 'Upload failed. Try again.'
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-60 flex flex-col bg-[#0c0e12]"
      role="dialog"
      aria-modal="true"
      aria-label="Crop postcard photo"
    >
      <div class="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          class="font-type text-[0.65rem] uppercase tracking-[0.16em] text-[#c8bfb0]/70"
          :disabled="busy"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <p class="font-type text-[0.65rem] uppercase tracking-[0.22em] text-[#c8bfb0]/70">
          Crop photo
        </p>
        <button
          type="button"
          class="rounded-full bg-[#e0c56a] px-4 py-1.5 font-display text-sm font-medium text-[#1a2230] disabled:opacity-40"
          :disabled="busy"
          @click="confirm"
        >
          {{ busy ? 'Uploading…' : 'Use photo' }}
        </button>
      </div>

      <div class="min-h-0 flex-1 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Cropper
          ref="cropperRef"
          class="size-full"
          :src="src"
          :stencil-props="{ aspectRatio: 3 / 2 }"
        />
      </div>

      <p v-if="error" class="px-4 pb-4 text-center text-sm text-red-300" role="alert">
        {{ error }}
      </p>
    </div>
  </Teleport>
</template>
