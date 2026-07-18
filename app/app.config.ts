export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yellow',
      secondary: 'blue',
      neutral: 'neutral',
    },

    navigationMenu: {
      variants: {
        active: {
          false: {
            link: 'text-white/75',
            linkLeadingIcon: 'text-white/65',
          },
        },
      },
      compoundVariants: [
        {
          variant: 'pill',
          active: true,
          highlight: false,
          class: {
            link: 'before:bg-secondary-900/75',
          },
        },
      ],
    },
  },
})
