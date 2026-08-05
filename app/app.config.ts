export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yellow',
      secondary: 'blue',
      neutral: 'neutral',
    },

    badge: {
      slots: {
        base: '[--ui-radius:0.5rem]',
      },
    },

    empty: {
      slots: {
        title: 'font-display font-normal text-secondary-950',
      },
    },

    navigationMenu: {
      variants: {
        active: {
          false: {
            link: 'text-secondary-300',
            linkLeadingIcon: 'text-secondary-300',
          },
        },
      },
      compoundVariants: [
        {
          variant: 'pill',
          active: true,
          highlight: false,
          class: {
            link: 'before:bg-secondary-900',
          },
        },
      ],
    },

    pageCard: {
      slots: {
        container: 'gap-y-2 sm:p-4',
      },
    },

    sidebar: {
      variants: {
        side: {
          left: {
            container: 'inset-s-0 border-e border-secondary-900',
            rail: 'inset-e-0 translate-x-1/2 rtl:-translate-x-1/2',
          },
        },
      },
      compoundVariants: [
        {
          side: 'left',
          collapsible: 'none',
          class: {
            root: 'border-e border-secondary-800',
          },
        },
      ],
    },
  },
})
