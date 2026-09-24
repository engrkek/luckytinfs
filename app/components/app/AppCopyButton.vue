<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

const props = defineProps<{ value: string, label: string }>()

const { copy, copied } = useClipboard()

// Contextual icon swap: scale 0.25→1, opacity 0→1, blur 4px→0
const iconMotion = {
  initial: { scale: 0.25, opacity: 0, filter: 'blur(4px)' },
  animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
  exit: { scale: 0.25, opacity: 0, filter: 'blur(4px)' },
  transition: { type: 'spring', duration: 0.3, bounce: 0 },
} as const
</script>

<template>
  <UButton
    size="xs"
    color="neutral"
    variant="ghost"
    :aria-label="copied ? 'Copied' : `Copy ${props.label}`"
    @click="copy(props.value)"
  >
    <template #leading>
      <span class="relative grid size-4 place-items-center">
        <AnimatePresence :initial="false" mode="popLayout">
          <motion.span v-if="copied" key="check" class="grid" v-bind="iconMotion">
            <UIcon name="ph:check" class="size-4 text-success" />
          </motion.span>
          <motion.span v-else key="copy" class="grid" v-bind="iconMotion">
            <UIcon name="ph:copy" class="size-4" />
          </motion.span>
        </AnimatePresence>
      </span>
    </template>
  </UButton>
</template>
