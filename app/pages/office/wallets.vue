<script setup lang="ts">
import type { Channel } from '#shared/types'
import { LazyOfficeWalletForm } from '#components'

useHead({ title: 'Wallets' })

const overlay = useOverlay()
const walletForm = overlay.create(LazyOfficeWalletForm)

const { data: channels } = useFetch<Channel[]>('/api/office/channels', { key: 'office-channels' })
</script>

<template>
  <UDashboardPanel id="wallets">
    <template #body>
      <div class="flex">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Wallets
          </h1>
          <p class="text-muted">
            Manage donation & payment channels.
          </p>
        </div>
        <div class="ml-auto">
          <UButton icon="ph:plus" label="Add Wallet" @click="walletForm.open({ type: 'new' })" />
        </div>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <OfficeWalletTable v-if="channels" :channels="channels" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
