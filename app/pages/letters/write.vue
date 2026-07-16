<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import { TextAlign } from '@tiptap/extension-text-align'

const background = ref('bg-maloi-50')
const font = ref('font-hand')

const showBgTray = ref(false)
const showFontTray = ref(false)

const items: EditorToolbarItem[][] = [
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'ph:text-bolder',
      tooltip: { text: 'Bold' },
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'ph:text-italic',
      tooltip: { text: 'Italic' },
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'ph:text-underline',
      tooltip: { text: 'Underline' },
    },
  ],
  [
    {
      kind: 'textAlign',
      align: 'left',
      icon: 'ph:text-align-left',
      tooltip: { text: 'Align Left' },
    },
    {
      kind: 'textAlign',
      align: 'center',
      icon: 'ph:text-align-center',
      tooltip: { text: 'Align Center' },
    },
    {
      kind: 'textAlign',
      align: 'right',
      icon: 'ph:text-align-right',
      tooltip: { text: 'Align Right' },
    },
    {
      kind: 'textAlign',
      align: 'justify',
      icon: 'ph:text-align-justify',
      tooltip: { text: 'Align Justify' },
    },
  ],
]

const backgrounds = {
  butter: 'bg-maloi-50',
  sky: 'bg-jhoanna-50',
}

const fonts = {
  hand: 'font-hand',
  script: 'font-script',
}

function toggleBgTray() {
  showBgTray.value = !showBgTray.value
}

function toggleFontTray() {
  showFontTray.value = !showFontTray.value
}
</script>

<template>
  <div class="w-full min-h-dvh flex flex-col">
    <div>
      <!--  -->
    </div>

    <div class="flex-1 overflow-x-hidden overflow-y-auto w-full flex flex-col items-center justify-center px-4">
      <div class="w-full aspect-8/11 p-6 drop-shadow-lg" :class="[background, font]">
        <UEditor
          v-slot="{ editor }"
          :extensions="[
            TextAlign.configure({ types: ['paragraph'] }),
          ]"
          placeholder="Start writing..."
          class="w-full"
        >
          <UEditorToolbar :editor="editor" :items="items" layout="bubble" />
        </UEditor>
      </div>
    </div>

    <div>
      <div class="flex items-center gap-2 px-4 py-3 border-y border-default">
        <template v-if="showBgTray">
          <div
            v-for="(item, index) in backgrounds"
            :key="index"
            class="size-15 cursor-pointer"
            :class="item"
            @click="background = item"
          />
        </template>

        <template v-else-if="showFontTray">
          <div
            v-for="(item, index) in fonts"
            :key="index"
            class="cursor-pointer text-xl"
            :class="item"
            @click="font = item"
          >
            Aa
          </div>
        </template>
      </div>
      <div class="flex items-center px-4 py-3">
        <UButton icon="tabler:background" variant="ghost" @click="toggleBgTray" />
        <UButton icon="tabler:abc" variant="ghost" @click="toggleFontTray" />
      </div>
    </div>
  </div>
</template>
