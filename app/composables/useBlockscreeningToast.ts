export type BlockscreeningToastType = 'success' | 'error'

/** Bespoke toast banner shared by the admin console and its mutations (kept custom to match the ticket/beach theme). */
export function useBlockscreeningToast() {
  const message = useState('blockscreening-toast-message', () => '')
  const type = useState<BlockscreeningToastType>('blockscreening-toast-type', () => 'success')

  function show(text: string, kind: BlockscreeningToastType = 'success') {
    message.value = text
    type.value = kind
    setTimeout(() => {
      if (message.value === text)
        message.value = ''
    }, 4000)
  }

  return { message, type, show }
}
