const STORAGE_KEY = 'blockscreening_admin_password'

/**
 * Shared block screening admin passcode (see requireBlockscreeningAdmin server-side).
 * Not a real session — a single shared passcode mirrored to sessionStorage so a
 * page refresh doesn't re-prompt. useState so the gate and every mutation share it.
 */
export function useBlockscreeningAuth() {
  const password = useState<string>('blockscreening-admin-password', () =>
    (import.meta.client ? sessionStorage.getItem(STORAGE_KEY) || '' : ''))

  function rememberPassword(value: string) {
    password.value = value
    if (import.meta.client)
      sessionStorage.setItem(STORAGE_KEY, value)
  }

  function adminHeaders() {
    return { 'X-Admin-Password': password.value }
  }

  return { password, rememberPassword, adminHeaders }
}
