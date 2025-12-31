# SnipSeek
#### Video Demo: https://youtu.be/pBJbEMg7yBc
#### Description:

SnipSeek is a code snippet manager built for developers who are tired of losing that one useful function they wrote six months ago. For people who know the one snippet, it was perfect, they remember writing it, but now it's buried somewhere in a random project folder. This app seeks to help to fix that.

The core idea is this: save your snippets, organize them into collections, and find them later. But the interesting part is the search. SnipSeek uses AI-powered semantic search, so you can describe what you're looking for in plain English ("that function that debounces API calls") and actually find it, even if you didn't title it that way.

## How It Works

When you save a snippet, the app sends the title and description (not the code itself to save on tokens) to OpenAI's embedding API using the `text-embedding-3-small` model. It turns this text into a 1536-dimensional vector, which is basically a mathematical representation of what the snippet "means." These vectors get stored in a PostgreSQL database using the pgvector extension. When you search, your query also becomes a vector, and we find snippets with similar vectors using cosine similarity. It sounds fancy but it's really just math underneath the hood.

There's also regular text search as a fallback. If semantic search fails (rate limits, network issues, whatever), it falls back to ILIKE queries on title, description, and tags just for reliability.

## Tech Stack

- **Next.js 16.1.1** with the App Router. Server components everywhere possible, client components only when interactivity demands it.
- **Drizzle ORM** for database operations. I like it better than Prisma as it feels closer to actual SQL.
- **Neon Database** (PostgreSQL) with pgvector enabled for vector storage and similarity search.
- **Better Auth** for authentication. It supports Google, GitHub, Discord, and GitLab OAuth.
- **Monaco Editor** (the VS Code editor) for syntax highlighting. May seem overkill but it looks great!
- **shadcn/ui** components with a custom dark theme.
- **UploadThing** for profile photo uploads.

## Project Structure

The `src/` folder is where everything lives:

- **`app/`** - All the routes. Split into `(app)` for authenticated dashboard stuff and `(public)` for landing page, explore, and auth pages. The parentheses mean those folder names don't show up in URLs.

- **`actions/`** - Server actions organized by domain. `snippets/` has CRUD operations, search, visibility toggles, etc. `collections/` handles collection management. `user/` does profile updates and account deletion. Each domain folder has multiple files (queries, create, update, delete) to keep things modular.

- **`components/`** - React components. `layout/` has the dashboard shell and navigation. `snippets/` has forms, cards, code viewers. `search/` has the command palette (Cmd+K to open). `settings/` has profile editing and the delete account button.

- **`lib/`** - Shared utilities. `auth/` has Better Auth config and session helpers. `db/` has Drizzle schema and connection. `openai/` has embedding generation with retry logic. `validation/` has Zod schemas for form validation.

- **`proxy.ts`** - This is basically middleware the intercepts incoming requests (it was renamed to proxy in Next.js version 16). I use it to inject user data into request headers. Dashboard routes get `x-user-id`, `x-user-email`, etc. headers added automatically. I did this because in development I noticed multiple duplicate database queries and wanted to fix that. With react's 'cache' function, I am able to memoize the user's details so that all subsequent db queries use the cached data.

## File Structure

Here's a detailed breakdown of the key files and what they do:

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with metadata, fonts, and Toaster
│   ├── globals.css                   # Global styles and Tailwind CSS configuration
│   ├── (app)/
│   │   ├── layout.tsx                # Authenticated app layout with DashboardShell
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard home. It shows recent snippets and collections
│   │       ├── snippets/
│   │       │   ├── page.tsx          # List all user snippets with filters
│   │       │   ├── new/page.tsx      # Create new snippet form page
│   │       │   └── [id]/
│   │       │       ├── page.tsx       # View individual snippet
│   │       │       └── edit/page.tsx  # Edit snippet form page
│   │       ├── collections/
│   │       │   ├── page.tsx          # List all collections
│   │       │   └── [id]/page.tsx     # View collection with its snippets
│   │       └── settings/page.tsx     # User profile settings page
│   ├── (public)/
│   │   ├── layout.tsx                 # Public layout with PublicHeader
│   │   ├── page.tsx                  # Landing page with features and CTA
│   │   ├── explore/
│   │   │   ├── page.tsx              # Browse public snippets with search
│   │   │   └── [id]/page.tsx         # View public snippet
│   │   ├── sign-in/
│   │   │   ├── layout.tsx             # Metadata for sign-in page
│   │   │   └── page.tsx               # OAuth sign-in buttons
│   │   └── sign-up/
│   │       ├── layout.tsx             # Metadata for sign-up page
│   │       └── page.tsx               # OAuth sign-up buttons
│   └── api/
│       ├── auth/[...all]/route.ts     # Better Auth catch-all route handler
│       └── uploadthing/
│           ├── core.ts                # UploadThing configuration for profile images
│           └── route.ts              # UploadThing API route handler
│
├── actions/
│   ├── snippets/
│   │   ├── create.ts                 # Create snippet with embedding generation
│   │   ├── update.ts                 # Update snippet, regenerate embedding if title/desc changes
│   │   ├── delete.ts                 # Delete snippet
│   │   ├── search.ts                 # Search snippets (text or semantic with pgvector)
│   │   ├── queries.ts                # Helper query functions for fetching snippets
│   │   ├── move.ts                   # Move snippet to different collection
│   │   ├── visibility.ts             # Toggle public/private visibility
│   │   └── index.ts                  # Export all snippet actions
│   ├── collections/
│   │   ├── create.ts                 # Create new collection
│   │   ├── update.ts                 # Rename collection
│   │   ├── delete.ts                 # Delete collection (moves snippets to Uncategorized)
│   │   ├── queries.ts                # Fetch collections and their snippet counts
│   │   └── index.ts                  # Export all collection actions
│   └── user/
│       └── index.ts                   # Update profile and delete account actions
│
├── components/
│   ├── layout/
│   │   ├── dashboard-shell.tsx        # Main dashboard layout wrapper with sidebar
│   │   ├── sidebar.tsx               # Navigation sidebar for authenticated users
│   │   ├── header.tsx                # Dashboard header with search and use menu
│   │   ├── public-header.tsx          # Public pages header with logo and sign-in
│   │   └── user-button.tsx            # User dropdown menu with profile and sign-out
│   ├── snippets/
│   │   ├── snippet-form.tsx          # Form for creating/editing snippets (Monaco editor)
│   │   ├── snippet-card.tsx          # Card component for displaying snippet preview
│   │   ├── snippet-grid.tsx          # Grid layout for displaying multiple snippet cards
│   │   ├── snippet-code-view.tsx     # Read-only code viewer using Monaco Editor
│   │   └── snippet-actions.tsx       # Dropdown menu with edit/delete/move actions
│   ├── collections/
│   │   ├── collection-card.tsx       # Card showing collection name and snippet count
│   │   └── create-collection-dialog.tsx  # Dialog form for creating collections
│   ├── search/
│   │   ├── command-palette.tsx       # Cmd+K command palette with search (dashboard)
│   │   └── explore-search.tsx        # Search component for public explore page
│   ├── settings/
│   │   ├── settings-form.tsx         # Profile form with name and photo upload
│   │   └── danger-zone.tsx           # Delete account button with confirmation
│   ├── shared/
│   │   ├── code-editor.tsx           # Monaco Editor wrapper component
│   │   ├── code-preview.tsx          # Syntax-highlighted code preview
│   │   ├── language-badge.tsx        # Badge showing programming language
│   │   ├── tag-list.tsx              # Display tags as chips
│   │   ├── empty-state.tsx           # Empty state component for empty lists
│   │   └── logo.tsx                  # Logo component
│   └── ui/                           # shadcn/ui components (button, card, avatar, etc.)
│
├── lib/
│   ├── auth/
│   │   ├── index.ts                  # Better Auth configuration with OAuth providers
│   │   ├── client.ts                  # Client-side auth functions
│   │   └── session.ts                # Server-side session helpers (getSession, requireAuth)
│   ├── db/
│   │   ├── index.ts                  # Drizzle database connection (Neon)
│   │   ├── schema.ts                 # Database schema (user, session, account, collection, snippet)
│   │   └── migrations/               # Drizzle migration files
│   ├── openai/
│   │   ├── index.ts                  # OpenAI client initialization
│   │   ├── constants.ts              # Embedding model name and retry constants
│   │   └── embeddings.ts             # Generate embeddings with exponential backoff retry
│   ├── validation/
│   │   └── index.ts                  # Zod schemas for all form inputs
│   ├── paths.ts                      # Centralized route path constants
│   ├── utils.ts                      # Utility functions (cn, generateId, sanitizeText)
│   └── uploadthing.ts                # UploadThing client configuration
│
└── proxy.ts                          # Next.js middleware for auth and header injection
```

### Key Files Explained

**`src/lib/db/schema.ts`** - Defines all database tables using Drizzle ORM. The `snippet` table has a `vector` column (pgvector type) for storing embeddings, and there's an HNSW index on it for fast similarity searches.

**`src/lib/openai/embeddings.ts`** - Handles embedding generation with retry logic. If the OpenAI API fails (rate limits, network issues), it retries up to 2 times with exponential backoff. Returns `null` if all attempts fail, which triggers fallback to text search.

**`src/actions/snippets/search.ts`** - Handles semantic search. It takes a query string, generates an embedding for it, then uses PostgreSQL's `<=>` operator (cosine distance) to find similar snippets. It falls back to text search if embedding generation fails.

**`src/components/search/command-palette.tsx`** - A command palette accessible via Cmd+K (or Ctrl+K). Supports both text and semantic search modes, with filters for language and collection. Uses keyboard navigation and shows results in real-time.

**`src/components/snippets/snippet-form.tsx`** - The form for creating/editing snippets. Uses Monaco Editor for code input with syntax highlighting and handles validation, sanitization, and shows toast notifications if embedding generation fails.

**`src/proxy.ts`** - Intercepts all requests and injects user session data into headers (`x-user-id`, `x-user-email`, etc.) for authenticated routes. This allows server components to read user info from headers instead of querying the database repeatedly.

**`src/lib/validation/index.ts`** - All Zod schemas in one place. Validates snippet titles (max 200 chars), descriptions (max 1000 chars), code (max 10,000 chars), tags (max 10 tags, 30 chars each), and collections (max 100 chars).

## Design Decisions

**Why collections instead of just tags?** Both work, but collections give you a natural hierarchy. Every user gets an "Uncategorized" collection by default. You can't delete it—if you delete another collection, snippets move there instead of disappearing.

**Why restrict deleting collections with snippets?** Initially I had cascade delete (delete collection = delete snippets), but that felt dangerous. Now the app moves snippets to Uncategorized first, then deletes the empty collection. I feel that's safer.

**Why not light mode?** Honestly just time. The dark theme is custom-built with syntax-highlighting-inspired accent colors (cyan, purple, amber, emerald). Adding light mode means doubling the color work. I intend on making this app better if it gains traction.

**Why semantic search over just tagging?** People aren't very great at tagging consistently. You'll tag something "api" one day and "http" the next. Semantic search doesn't care. It understands that "fetch data from server" and "API call" mean the same thing.

## Running It Locally

You'll need Node 18+, pnpm (or any nodejs-based package manager), a Neon database with pgvector, and OpenAI API access.

```bash
pnpm install
pnpm db:generate # if you decide to delete the migrations folder or make schema changes.
pnpm db:migrate # or pnpm db:push
pnpm dev
```

Set up your `.env.local` with database URL, auth secrets, OAuth credentials, and OpenAI key.

That's pretty much it. It's a tool I'd actually use, and I'm hoping to get other developers on board.