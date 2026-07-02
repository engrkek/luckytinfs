# Luckytin Fan Support

A fan support website for **BINI Maloi** and **BINI Jhoanna**.

## Tech Stack

- [Nuxt 4](https://nuxt.com)
- [Nuxt UI](https://ui.nuxt.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [VueUse](https://vueuse.org)
- [Nuxt Image](https://image.nuxt.com)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)
- [pnpm](https://pnpm.io) (see `packageManager` in `package.json`)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/enter` until the Wi-Fi gate password is accepted.

To preview a specific gate UI during development, append an OS override query parameter:

| URL | Gate UI |
| --- | --- |
| `http://localhost:3000/enter?os=ios` | iOS |
| `http://localhost:3000/enter?os=android` | Android |
| `http://localhost:3000/enter?os=other` | Fallback |

### Production

```bash
pnpm build    # SSR build
pnpm preview  # Preview the production build locally

pnpm generate # Static site generation
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NUXT_PUBLIC_SITE_PASSWORD` | Password required to enter the site. Leave empty to disable the gate entirely. |
| `NUXT_PUBLIC_NETWORK_NAME` | Network name shown in the Wi-Fi gate UI (default: `LuckyTinFS_Guest`). |

These map to `runtimeConfig.public` in `nuxt.config.ts`. Values in `.env` override the defaults at build/runtime.

## Project Structure

```
app/
├── assets/
│   ├── css/main.css       # Theme tokens (maloi / jhoanna colors), utilities
│   └── icons/             # Custom icon collection
├── components/
│   ├── Polaroid.vue       # Stacked polaroid photo component
│   └── wifi-gate/         # OS-specific Wi-Fi gate screens
├── composables/
│   ├── useDeviceOs.ts     # iOS / Android / other detection (+ dev override)
│   └── useSiteAccess.ts   # Gate password check and cookie state
├── middleware/
│   └── site-auth.global.ts  # Redirects unauthenticated users to /enter
└── pages/
    ├── index.vue          # Landing page
    └── enter.vue          # Wi-Fi gate entry
public/
└── images/                # Hero and polaroid assets
```

## How the Gate Works

1. Global middleware checks whether the visitor has a valid access cookie.
2. Unauthenticated requests are redirected to `/enter` with a `redirect` query preserving the original path.
3. On `/enter`, the user submits a password through the Wi-Fi gate UI.
4. A correct password sets a `luckytinfs-wifi-connected` cookie and sends the user to their intended destination.
5. If `NUXT_PUBLIC_SITE_PASSWORD` is unset, the gate is skipped and all routes are open.

## License

Private project. Not licensed for redistribution.