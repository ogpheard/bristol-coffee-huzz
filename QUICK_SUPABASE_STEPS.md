# Quick Supabase Setup - Do These Steps Now!

## 🎯 Quick Summary

You need to:
1. Create a Supabase account
2. Get 2 connection strings
3. Update your `.env` file
4. Run 3 commands

**Time needed:** 10 minutes

---

## ✅ Step-by-Step Checklist

### □ Step 1: Create Supabase Project (5 min)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign in with **GitHub**
4. Click **"New Project"**
5. Enter:
   - Name: `bristol-cafe-quest`
   - Password: *(create a strong one - SAVE IT!)*
   - Region: `West EU (London)` or closest to you
6. Click **"Create new project"**
7. ⏱️ Wait 2-3 minutes

---

### □ Step 2: Get Connection Strings (2 min)

When your project is ready:

1. Click **"Settings"** (gear icon) in sidebar
2. Click **"Database"**
3. Scroll to **"Connection string"** section
4. Select **"Transaction"** from dropdown
5. You'll see two connection strings - copy both:

**📝 Write these down or keep the tab open!**

```
Connection Pooler (port 6543):
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres

Direct Connection (port 5432):
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
```

6. Replace `[PASSWORD]` with your actual password

---

### □ Step 3: Update .env File (1 min)

1. Open the `.env` file in your project
2. Replace the two placeholder lines with your actual connection strings:

```env
DATABASE_URL="your-pooler-connection-string-here"
DIRECT_URL="your-direct-connection-string-here"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres.abcdef123:MySecretPass@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.abcdef123:MySecretPass@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

3. Save the file

---

### □ Step 4: Run These Commands (2 min)

Open your terminal and run these one by one:

```bash
# 1. Generate Prisma client for PostgreSQL
npx prisma generate

# 2. Create tables in Supabase
npx prisma db push

# 3. Import all 513 cafés
npm run import-cafes
```

---

### □ Step 5: Test It Works (1 min)

1. Restart your dev server:
   - Press `Ctrl + C` to stop it
   - Run `npm run dev` to start it again

2. Open http://localhost:3000

3. Check:
   - ✅ Go to "To Visit" - see all cafés?
   - ✅ Go to "Map" - see all pins?
   - ✅ Try adding a visit

4. Check Supabase dashboard:
   - Go to Supabase → **"Table Editor"**
   - Click **"Cafe"** table
   - You should see 513 rows! 🎉

---

## 🚨 Common Issues

**"Can't reach database server"**
→ Check your connection strings in `.env` - did you replace the password?

**"No cafés showing up"**
→ Run `npm run import-cafes` again

**Tables not created**
→ Make sure `DIRECT_URL` is set in `.env`

---

## ✅ You're Done!

Once the above works, you're ready to:
- Deploy to Vercel
- Share with friends
- Start your café quest!

See **SUPABASE_SETUP.md** for the detailed guide and deployment instructions.