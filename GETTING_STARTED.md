# Bristol Café Quest - Getting Started Guide

Welcome to Bristol Café Quest! This guide will help you understand how to use and customize your new website.

## What You Have Built

Bristol Café Quest is a full-stack web application with:
- **Frontend**: Next.js 15 with React and TypeScript
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Database**: SQLite with Prisma (easy to use, file-based database)
- **Maps**: Mapbox GL JS (interactive maps)

## Your Website is Running! 🎉

The website is currently running at: **http://localhost:3000**

Open this URL in your web browser to see your website.

## What's Been Created

### Pages
1. **Home** (`/`) - Welcome page with an overview
2. **Add Visit** (`/add-visit`) - Log café visits with ratings
3. **Map** (`/map`) - Interactive map showing all cafés
4. **Visited** (`/visited`) - Sortable table of visited cafés
5. **To Visit** (`/to-visit`) - List of unvisited cafés
6. **Scoreboard** (`/scoreboard`) - Progress tracking and leaderboards

### Features
- ✅ Fuzzy search autocomplete for café names
- ✅ Rating system (vibe, food, coffee, price)
- ✅ Visitor tracking (Eleanor, Hannah, Anna)
- ✅ Interactive maps with color-coded pins
- ✅ Statistics and leaderboards
- ✅ Area-based progress tracking
- ✅ 513 Bristol cafés imported from your JSON file

## How to Use

### Starting the Website
```bash
cd "/Users/oliverheard/Documents/Coding Projects/Bristol Brew/bristol-cafe-quest"
npm run dev
```

This starts the development server. The website will be available at http://localhost:3000

### Stopping the Website
Press `Ctrl + C` in the terminal where the server is running.

### Adding a Visit
1. Go to the "Add Visit" page
2. Start typing a café name - autocomplete will show suggestions
3. Select a café or create a new one
4. Choose who visited
5. Rate the café (1-5 stars for each category)
6. Add optional details (items bought, recommendations, notes)
7. Click "Save Visit"

### Viewing Progress
- **Map**: See all cafés on an interactive map with color-coded ratings
- **Visited**: Browse all visited cafés in a sortable table
- **To Visit**: See which cafés you haven't visited yet
- **Scoreboard**: Check progress, leaderboards, and top-rated cafés

## Customization

### Change Visitor Names
Edit `/app/add-visit/page.tsx`, line 14:
```typescript
const VISITORS = ['Eleanor', 'Hannah', 'Anna']
```

### Change the Website Colors
The website uses an amber/orange color scheme. To change:
1. Open any page file (e.g., `/app/page.tsx`)
2. Look for Tailwind classes like `bg-amber-600`, `text-amber-900`
3. Replace `amber` with another color like `blue`, `green`, `purple`, etc.

### Add More Cafés
If you find cafés missing from your original list:
1. Add them to `bristol_coffee_tea_filtered.json`
2. Run: `npm run import-cafes`

Or add them directly through the "Add Visit" page when logging a visit.

## Setting Up the Map (Optional)

The map feature requires a free Mapbox token:

1. Go to https://www.mapbox.com and create a free account
2. Copy your access token
3. Create a file called `.env.local` in the project folder
4. Add this line to the file:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
   ```
5. Restart the server

Without a token, the map page will show instructions for how to get one.

## Database

Your data is stored in a SQLite database file at:
```
prisma/dev.db
```

This is a single file that contains all your visits and café data. You can back it up by copying this file.

### Resetting the Database
If you want to start fresh:
```bash
rm prisma/dev.db
npx prisma db push
npm run import-cafes
```

## Deploying to the Internet

When you're ready to deploy (put it online), you have several options:

### Option 1: Vercel (Recommended - Free)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Connect your GitHub repository
5. Deploy!

### Option 2: Netlify
1. Go to https://netlify.com
2. Drag and drop your project folder
3. Configure build settings
4. Deploy!

**Note**: For deployment, you'll need to:
1. Push your code to GitHub first
2. Change from SQLite to a cloud database (like PostgreSQL)
3. Add your Mapbox token to the deployment settings

## Project Structure

```
bristol-cafe-quest/
├── app/                    # All your pages
│   ├── add-visit/         # Add Visit page
│   ├── map/               # Map page
│   ├── visited/           # Visited page
│   ├── to-visit/          # To Visit page
│   ├── scoreboard/        # Scoreboard page
│   ├── api/               # Backend API routes
│   ├── layout.tsx         # Main layout (header, navigation)
│   └── page.tsx           # Home page
├── lib/                   # Shared code
│   └── prisma.ts         # Database connection
├── prisma/               # Database files
│   ├── schema.prisma     # Database structure
│   └── dev.db           # Your actual database
├── scripts/              # Utility scripts
│   └── import-cafes.ts  # Imports café data
└── package.json         # Project dependencies
```

## Common Commands

```bash
# Start the development server
npm run dev

# Import café data
npm run import-cafes

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9
# Then try again
npm run dev
```

### Database Errors
If you see database errors:
```bash
npx prisma generate
npx prisma db push
```

### Module Not Found
If you see "module not found" errors:
```bash
npm install
```

## Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/learn
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Prisma**: https://www.prisma.io/docs
- **TypeScript**: https://www.typescriptlang.org/docs

## Questions?

Since you're new to coding, here are some key concepts:

- **TypeScript** (.tsx, .ts files): JavaScript with types - helps catch errors
- **Components**: Reusable pieces of UI (like buttons, forms)
- **API Routes**: Backend code that handles data (in /app/api/)
- **State**: Data that changes (like form inputs)
- **Props**: Data passed between components

Feel free to explore the code! Each file has comments explaining what it does.

Enjoy tracking your Bristol café adventures! ☕