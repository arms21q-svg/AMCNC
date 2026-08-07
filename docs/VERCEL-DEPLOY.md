# نشر Vercel — دليل سريع

## 1. متغيرات البيئة (إلزامية)

في **Vercel → Project → Settings → Environment Variables**  
فعّل **Production** (و Preview إن أردت) ثم **Redeploy**.

| المتغير | من أين | مثال |
|---------|--------|------|
| `DATABASE_URL` | Supabase → Database → URI (Session pooler **5432**) | `postgresql://postgres.xxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` |
| `DIRECT_URL` | نفس الرابط أعلاه | نفس القيمة |
| `JWT_SECRET` | توليد عشوائي **32+ حرف** | انظر أدناه |
| `NEXT_PUBLIC_SITE_URL` | رابط موقعك على Vercel | `https://amcnc.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role) | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | اسم bucket | `project-images` |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | رقم واتساب | `9665xxxxxxxx` |

### توليد JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
انسخ الناتج كاملاً (64 حرف hex) إلى `JWT_SECRET`.

> **لا تستخدم** القيمة من `.env.example` مثل `your-super-secret-jwt-key-change-in-production` — أقل من 32 حرف أو weak.

---

## 2. التحقق بعد النشر

افتح في المتصفح:
```
https://YOUR-SITE.vercel.app/api/health
```

- `"status":"ok"` → الإعدادات صحيحة
- `"status":"misconfigured"` → راجع `missing` في JSON

---

## 3. قاعدة البيانات (مرة واحدة)

من جهازك المحلي (بعد ضبط `.env.local`):
```bash
npm run db:push
npm run db:seed
```

---

## 4. تسجيل الدخول

```
https://YOUR-SITE.vercel.app/admin/login
```
- Email: `admin@amcncwood.com`
- Password: `admin123`

---

## أخطاء شائعة

| الرسالة | السبب | الحل |
|---------|--------|------|
| Server configuration error | `JWT_SECRET` أو `DATABASE_URL` ناقص | أضف المتغيرات + **Redeploy** |
| Database connection failed | Supabase متوقف أو رابط خاطئ | Wake project في Supabase، port **5432** |
| Invalid credentials | DB غير مهيأ | `npm run db:seed` |

**مهم:** بعد أي تغيير في Environment Variables يجب **Redeploy** من Vercel (Deployments → ⋮ → Redeploy).
