import type { TourStopId } from './tour'
import type { LetterDesign, LetterRecipient } from './types'

export interface PublicLetter {
  id: string
  recipient: LetterRecipient
  tourStop: TourStopId
  senderName: string
  body: string
  design: LetterDesign
  createdAt: string
}

export const DEMO_LETTERS: PublicLetter[] = [
  {
    id: 'demo-maloi-1',
    recipient: 'maloi',
    tourStop: 'honolulu',
    senderName: 'a lumity from manila',
    body: `Maloi,

Thank you for the way your voice feels like sunlight after rain. Every pantropiko night, every soft high note — I carry them with me on ordinary Tuesdays.

Wherever Signals takes you, know that somewhere a fan is humming along, holding a lightstick, sending love across time zones.

Stay soft. Stay loud. Stay you.

With all my yellow hearts,
— m.`,
    design: {
      background: 'bg-16',
      font: 'hand',
      envelope: 'envelope-cream',
      seal: 'seal-7',
      stickers: [
        { id: 'sticker-27', x: 82, y: 14, rotation: -12, scale: 1.1 },
        { id: 'sticker-31', x: 14, y: 78, rotation: 18, scale: 0.95 },
        { id: 'sticker-23', x: 86, y: 72, rotation: 8, scale: 0.85 },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-jhoanna-1',
    recipient: 'jhoanna',
    tourStop: 'honolulu',
    senderName: 'bloom from Cebu',
    body: `Dear Jhoanna,

You make leading look like kindness with a backbone. Watching you hold the stage and still glance back at the members — that is the kind of love I want to grow into.

This letter is a paper thank-you for every speech that made me braver.

Blue skies always,
a bloom`,
    design: {
      background: 'bg-17',
      font: 'script',
      envelope: 'envelope-sky',
      seal: 'seal-8',
      stickers: [
        { id: 'sticker-25', x: 78, y: 16, rotation: 12, scale: 1 },
        { id: 'sticker-26', x: 16, y: 74, rotation: -16, scale: 0.95 },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-bini-1',
    recipient: 'bini',
    tourStop: 'honolulu',
    senderName: 'Anonymous',
    body: `BINI,

Eight hearts, one signal.

From living rooms to arenas, you taught a whole generation that joy can be serious work — and that work can still sparkle.

These letters travel with you. So do we.

See you on the road,
the blooms & lumities of the world`,
    design: {
      background: 'bg-19',
      font: 'type',
      envelope: 'envelope-blush',
      seal: 'seal-9',
      // BINI — Pantropiko (official audio / video on YouTube)
      music: 'https://www.youtube.com/watch?v=L4KvD79RwbM',
      stickers: [
        { id: 'sticker-22', x: 82, y: 12, rotation: -8, scale: 1 },
        { id: 'sticker-32', x: 18, y: 82, rotation: 0, scale: 1.05 },
        { id: 'sticker-24', x: 72, y: 78, rotation: 18, scale: 0.9 },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-maloi-2',
    recipient: 'maloi',
    tourStop: 'honolulu',
    senderName: 'lucky tin',
    body: `hi maloi !!

if this finds you in san diego (or any city that still smells like airplane coffee), i hope you feel how loud we are even when the venue is quiet.

your laughter is my favorite encore.

💛`,
    design: {
      background: 'bg-18',
      font: 'hand',
      envelope: 'envelope-white',
      seal: 'seal-5',
      stickers: [
        { id: 'sticker-29', x: 50, y: 88, rotation: 0, scale: 1.15 },
      ],
    },
    createdAt: new Date().toISOString(),
  },
]

export function isLetterRecipient(value: string): value is LetterRecipient {
  return value === 'maloi' || value === 'jhoanna' || value === 'bini'
}
