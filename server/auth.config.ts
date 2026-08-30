import { defineServerAuth } from '@nuxtjs/better-auth/config'
import { admin as adminPlugin } from 'better-auth/plugins'

export default defineServerAuth({
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    adminPlugin(),
  ],
})
