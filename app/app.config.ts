export default defineAppConfig({
  ui: {
    colors: {
      primary: 'jhoanna',
      secondary: 'maloi',
      neutral: 'neutral',
    },

    drawer: {
      slots: {
        title: 'font-display font-bold text-2xl tracking-tighter',
      },
    },

    empty: {
      slots: {
        title: 'font-display font-normal tracking-tighter',
      },
    },

    pageCard: {
      slots: {
        container: 'gap-y-2 sm:p-4',
      },
    },

    slideover: {
      slots: {
        title: 'font-display font-bold text-2xl tracking-tighter',
      },
    },
  },
})
