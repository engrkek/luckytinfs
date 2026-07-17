import type { LetterDesign, LetterRecipient } from './types'

export interface PublicLetter {
  id: string
  recipient: LetterRecipient
  senderName: string
  body: string
  design: LetterDesign
  featuredOn: string | null
  createdAt: string
}

export const DEMO_LETTERS: PublicLetter[] = [
  {
    id: 'demo-maloi-1',
    recipient: 'maloi',
    senderName: 'a lumity from manila',
    body: `Maloi,

Thank you for the way your voice feels like sunlight after rain. Every pantropiko night, every soft high note — I carry them with me on ordinary Tuesdays.

Wherever Signals takes you, know that somewhere a fan is humming along, holding a lightstick, sending love across time zones.

Stay soft. Stay loud. Stay you.

With all my yellow hearts,
— m.`,
    design: {
      background: 'paper-floral',
      font: 'hand',
      envelope: 'envelope-cream',
      seal: 'seal-heart',
      stickers: [
        { id: 'sticker-heart', x: 82, y: 12, rotation: -12, scale: 1.2 },
        { id: 'sticker-sparkle', x: 12, y: 78, rotation: 18, scale: 1 },
        { id: 'sticker-flower', x: 88, y: 72, rotation: 8, scale: 0.9 },
      ],
    },
    featuredOn: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-jhoanna-1',
    recipient: 'jhoanna',
    senderName: 'bloom from Cebu',
    body: `Dear Jhoanna,

You make leading look like kindness with a backbone. Watching you hold the stage and still glance back at the members — that is the kind of love I want to grow into.

This letter is a paper thank-you for every speech that made me braver.

Blue skies always,
a bloom`,
    design: {
      background: 'paper-lined',
      font: 'script',
      envelope: 'envelope-sky',
      seal: 'seal-star',
      stickers: [
        { id: 'sticker-star', x: 78, y: 18, rotation: 15, scale: 1.1 },
        { id: 'sticker-plane', x: 14, y: 70, rotation: -20, scale: 1 },
      ],
    },
    featuredOn: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-bini-1',
    recipient: 'bini',
    senderName: 'Anonymous',
    body: `BINI,

Eight hearts, one signal.

From living rooms to arenas, you taught a whole generation that joy can be serious work — and that work can still sparkle.

This mailbox travels with you. So do we.

See you on the road,
the blooms & lumities of the world`,
    design: {
      background: 'paper-travel',
      font: 'type',
      envelope: 'envelope-blush',
      seal: 'seal-flower',
      // Pantropiko — demo soundtrack while reading
      music: 'https://open.spotify.com/track/6Csrqur3IfnVp0EtHskjMw',
      stickers: [
        { id: 'sticker-stamp', x: 80, y: 10, rotation: -8, scale: 1 },
        { id: 'sticker-sparkle', x: 20, y: 85, rotation: 0, scale: 1.15 },
        { id: 'sticker-heart', x: 70, y: 80, rotation: 22, scale: 0.85 },
      ],
    },
    featuredOn: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-maloi-2',
    recipient: 'maloi',
    senderName: 'lucky tin',
    body: `hi maloi !!

if this finds you in san diego (or any city that still smells like airplane coffee), i hope you feel how loud we are even when the venue is quiet.

your laughter is my favorite encore.

💛`,
    design: {
      background: 'paper-cream',
      font: 'hand',
      envelope: 'envelope-white',
      seal: 'seal-wax-gold',
      stickers: [
        { id: 'sticker-heart', x: 50, y: 88, rotation: 0, scale: 1.3 },
      ],
    },
    featuredOn: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
]

export function isLetterRecipient(value: string): value is LetterRecipient {
  return value === 'maloi' || value === 'jhoanna' || value === 'bini'
}
