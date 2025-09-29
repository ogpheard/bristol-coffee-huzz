# Supabase Setup Guide

This guide will help you migrate your Bristol Café Quest database from SQLite to Supabase (PostgreSQL).

## Why Supabase?

- ✅ Free tier includes 500MB database
- ✅ Works with Vercel and other hosting platforms
- ✅ Automatic backups
- ✅ Built-in authentication (if you want to add it later)
- ✅ Real-time subscriptions (if you want live updates)

---

## Step 1: Create Supabase Project

1. **Go to https://supabase.com**
2. Click **"Start your project"** or **"Sign In"**
3. Sign in with your **GitHub account** (recommended)
4. Click **"New Project"**
5. Fill in the details:
   - **Organization**: Select your account
   - **Name**: `bristol-cafe-quest`
   - **Database Password**: Create a strong password (e.g., `CafeQuest2024!Bristol`)
     - ⚠️ **SAVE THIS PASSWORD!** You'll need it soon
   - **Region**: Choose closest to you (e.g., "West EU (London)" for UK)
   - **Pricing Plan**: Free (perfect for this project)
6. Click **"Create new project"**
7. ⏱️ Wait 2-3 minutes while Supabase sets up your database

---

## Step 2: Get Your Connection Strings

Once your project is ready (green checkmark appears):

### Option A: Using the Connection Pooler (Recommended)

1. In Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"** in the left menu
3. Scroll to **"Connection string"** section
4. Select **"Transaction"** mode from the dropdown
5. You'll see two types of connections:

**Connection Pooler (for app):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Direct Connection (for migrations):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

6. Click **"Copy"** for each one
7. Replace `[YOUR-PASSWORD]` with the password you created in Step 1

### Option B: Getting the URI Directly

Alternatively:
1. Look for **"URI"** tab in the Connection string section
2. Copy the full connection string
3. You'll need to modify this for both `DATABASE_URL` and `DIRECT_URL`

---

## Step 3: Update Your Local .env File

1. Open the file `.env` in your project folder
2. Replace the placeholder values with your actual Supabase connection strings:

```env
# Replace with your actual connection strings from Supabase

# For serverless/edge functions (Transaction mode with pooler)
DATABASE_URL="postgresql://postgres.YOUR-REF:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# For migrations (Direct connection)
DIRECT_URL="postgresql://postgres.YOUR-REF:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"
```

**Example with real values:**
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123!@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

---

## Step 4: Push Your Database Schema to Supabase

Now we'll create the tables in Supabase:

```bash
cd "/Users/oliverheard/Documents/Coding Projects/Bristol Brew/bristol-cafe-quest"

# Generate Prisma client for PostgreSQL
npx prisma generate

# Push the schema to Supabase (creates tables)
npx prisma db push
```

You should see:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

---

## Step 5: Import Your Café Data to Supabase

Now import all 513 Bristol cafés:

```bash
npm run import-cafes
```

You should see:
```
Found 513 cafés to import
Imported 50 cafés...
Imported 100 cafés...
...
✅ Import complete!
   Imported: 513
```

---

## Step 6: Verify Everything Works

1. **Check Supabase Dashboard:**
   - Go to your Supabase dashboard
   - Click **"Table Editor"** in the left sidebar
   - You should see two tables: `Cafe` and `Visit`
   - Click on `Cafe` - you should see all 513 cafés!

2. **Test Your Local App:**
   - Make sure your dev server is running: `npm run dev`
   - Go to http://localhost:3000
   - Navigate to **"To Visit"** - you should see all cafés
   - Navigate to **"Map"** - you should see all pins on the map
   - Try adding a visit!

---

## Step 7: Update .env.local for Production

Your `.env.local` file should have your Mapbox token and can also have the database URLs:

```env
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoib2dwaGVhcmQiLCJhIjoiY21nNW12MGxiMDZ6czJrczJsbjU4b3ZuOCJ9.UO_ooAtXr8L8kPaz-_Ij6g

# Supabase (same as .env, but this one is for local development only)
DATABASE_URL="your-pooler-connection-string"
DIRECT_URL="your-direct-connection-string"
```

---

## Step 8: Commit and Push to GitHub

Now that you're using Supabase, let's update GitHub:

```bash
git add .
git commit -m "Migrate from SQLite to Supabase PostgreSQL"
git push
```

---

## Step 9: Deploy to Vercel (Optional)

Now you're ready to deploy online!

1. **Go to https://vercel.com**
2. **Sign in with GitHub**
3. Click **"Import Project"**
4. Select your `bristol-coffee-huzz` repository
5. **Add Environment Variables:**
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox token
   - `DATABASE_URL`: Your Supabase pooler connection string
   - `DIRECT_URL`: Your Supabase direct connection string
6. Click **"Deploy"**
7. ⏱️ Wait 2-3 minutes
8. 🎉 Your site is live!

---

## Troubleshooting

### Error: "Can't reach database server"
- Check your connection strings in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is active (green status in dashboard)

### Error: "SSL connection required"
- Add `?sslmode=require` to the end of your connection strings

### No cafés showing up
- Run `npm run import-cafes` again
- Check Supabase Table Editor to see if data is there

### Migration issues
- Make sure `DIRECT_URL` is set correctly
- Try running `npx prisma migrate reset` (⚠️ this deletes all data)

---

## Key Differences: SQLite vs Supabase

| Feature | SQLite (Old) | Supabase (New) |
|---------|--------------|----------------|
| Database file | Local `dev.db` | Cloud PostgreSQL |
| Deployment | ❌ Not supported | ✅ Works everywhere |
| Backups | Manual | Automatic |
| Concurrent users | Limited | Unlimited |
| Real-time updates | No | Yes (if you want) |

---

## Next Steps

Once everything is working:

1. ✅ Test adding visits locally
2. ✅ Deploy to Vercel
3. ✅ Share with Eleanor, Hannah, and Anna!
4. ✅ Start your café quest! ☕

---

## Security Notes

- ⚠️ **Never commit `.env` or `.env.local` to GitHub** (they're in `.gitignore`)
- ⚠️ Keep your database password secure
- ⚠️ For production, consider using Supabase Row Level Security (RLS) if you want authentication

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Check the GETTING_STARTED.md file for general help

Good luck with your Bristol café adventure! 🎉☕