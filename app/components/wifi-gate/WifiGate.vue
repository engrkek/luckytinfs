<script setup lang="ts">
defineProps<{
  networkName: string
  loading?: boolean
  error?: boolean
}>()

const emit = defineEmits<{
  submit: [password: string]
}>()

const { os } = useDeviceOs()

function onSubmit(password: string) {
  emit('submit', password)
}

function onCancel() {
}
</script>

<template>
  <WifiGateIos
    v-if="os === 'ios'"
    :network-name="networkName"
    :loading="loading"
    :error="error"
    @submit="onSubmit"
    @cancel="onCancel"
  />
  <WifiGateAndroid
    v-else-if="os === 'android'"
    :network-name="networkName"
    :loading="loading"
    :error="error"
    @submit="onSubmit"
    @cancel="onCancel"
  />
  <WifiGateFallback
    v-else
    :network-name="networkName"
    :loading="loading"
    :error="error"
    @submit="onSubmit"
  />
</template>
