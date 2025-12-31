export const paths = {
    publicPaths: {
        home: '/',
        explore: '/explore',
        exploreSnippet: (id: string) => `/explore/${id}`,
        signIn: '/sign-in',
        signUp: '/sign-up',
    },
    appPaths: {
        dashboard: '/dashboard',
        snippets: '/dashboard/snippets',
        snippetNew: '/dashboard/snippets/new',
        snippetView: (id: string) => `/dashboard/snippets/${id}`,
        snippetEdit: (id: string) => `/dashboard/snippets/${id}/edit`,
        collections: '/dashboard/collections',
        collectionView: (id: string) => `/dashboard/collections/${id}`,
        settings: '/dashboard/settings',
    }
  } as const;