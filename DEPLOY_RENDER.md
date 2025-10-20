# 🚀 Deploy Notion Manager ke Render

Panduan lengkap untuk deploy aplikasi Notion Manager ke Render.com

## ✅ Prerequisites

1. Account GitHub (untuk push code)
2. Account Render.com (free tier available)
3. Notion API Key dan Database IDs

## 📋 Langkah Deploy

### 1️⃣ Push Code ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Notion Manager with login/logout"

# Add remote repository (ganti dengan repo anda)
git remote add origin https://github.com/USERNAME/notion-manager.git

# Push
git push -u origin main
```

### 2️⃣ Create Web Service di Render

1. Login ke [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository anda
4. Configure settings:

**Build & Deploy Settings:**

- **Name**: `notion-manager` (atau nama lain)
- **Region**: Singapore (paling dekat)
- **Branch**: `main`
- **Root Directory**: (kosongkan)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**

- **Free** (untuk testing)

### 3️⃣ Configure Environment Variables

Di Render Dashboard, pergi ke **Environment** tab dan tambah:

| Key                    | Value                     | Contoh         |
| ---------------------- | ------------------------- | -------------- |
| `NODE_ENV`             | `production`              | production     |
| `NOTION_API_KEY`       | Your Notion API Key       | ntn_xxx...     |
| `DATABASE_ID`          | Your TODO Database ID     | 268ac0d2...    |
| `CALENDAR_DATABASE_ID` | Your Calendar Database ID | 188ac0d2...    |
| `APP_PASSWORD`         | Your login password       | [enter in env] |
| `HOLIDAY_STATE`        | Negeri untuk holidays     | Kelantan       |

**PENTING:**

- Jangan commit file `.env` ke GitHub!
- Semua environment variables mesti di-set di Render Dashboard

### 4️⃣ Deploy

1. Click **"Create Web Service"**
2. Render akan automatically:
   - Clone repository
   - Run `npm install`
   - Run `npm start`
   - Deploy aplikasi

### 5️⃣ Access Aplikasi

Selepas deploy berjaya, anda akan dapat URL:

```
https://notion-manager-xxxx.onrender.com
```

## 🔧 Troubleshooting

### Error: "Application failed to respond"

**Sebab:** Port configuration salah

**Fix:** Pastikan `server.js` menggunakan:

```javascript
const PORT = process.env.PORT || 3000;
```

### Error: "Cannot find module"

**Sebab:** Dependencies tidak install

**Fix:**

1. Check `package.json` ada semua dependencies
2. Render akan auto-run `npm install`

### Error: "Database connection failed"

**Sebab:** Environment variables tidak set

**Fix:**

1. Pergi ke Render Dashboard → Environment
2. Set semua environment variables
3. Redeploy

### Session tidak persist

**Sebab:** Free tier Render restart container selepas 15 minit idle

**Fix:**

- Upgrade ke paid tier untuk always-on service
- Atau gunakan external session store (Redis)

## 🎯 Production Checklist

- [x] PORT configuration dari environment
- [x] Start script point ke `server.js`
- [x] Node version specified di `package.json`
- [x] `.env` dalam `.gitignore`
- [ ] Environment variables set di Render
- [ ] HTTPS enabled (automatic di Render)
- [ ] Custom domain (optional)

## 📝 Notes

1. **Free Tier Limitations:**

   - Service akan sleep selepas 15 min idle
   - First request selepas sleep akan slow (cold start)
   - 750 hours/bulan free

2. **Session Management:**

   - Session disimpan di memory (default)
   - Session akan hilang bila server restart
   - Untuk production, consider Redis session store

3. **Logs:**
   - View logs di Render Dashboard → Logs tab
   - Untuk debug, check logs bila ada error

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Deploy Node.js Apps](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

## 💡 Tips

1. **Test locally first:**

   ```bash
   npm start
   ```

2. **Check logs:**

   - Di Render: Dashboard → Logs
   - Local: terminal output

3. **Redeploy:**
   - Push ke GitHub
   - Render auto-redeploy
   - Atau manual deploy di Dashboard

---

✅ **Deployment Ready!**

Aplikasi anda sekarang siap untuk deploy ke Render dengan semua configuration yang betul.
