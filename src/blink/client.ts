import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'blink-app-explorer-zkok0cyk',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xNVdlwpEMn2hMooGAr0P9SKhQTVTaBGP',
  authRequired: false,
  auth: { mode: 'managed' },
})
