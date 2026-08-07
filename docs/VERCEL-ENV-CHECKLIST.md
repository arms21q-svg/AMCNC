# قائمة متغيرات Vercel — انسخ من ملف .env المحلي
# Vercel → Settings → Environment Variables → Production → Save → Redeploy

# مطلوب للدخول وقاعدة البيانات:
# DATABASE_URL      ← من .env (port 6543)
# DIRECT_URL        ← من .env (port 5432)
# JWT_SECRET        ← من .env (بعد توليده)

# مطلوب للموقع:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  أو ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY             ← من Supabase Dashboard → API
# SUPABASE_STORAGE_BUCKET=project-images
# NEXT_PUBLIC_SITE_URL=https://amcnc-b0lgsixxx-asas2222.vercel.app
# NEXT_PUBLIC_WHATSAPP_PHONE=9665xxxxxxxx

# ⚠️ .env لا يُرفع إلى GitHub — يجب إضافته يدوياً في Vercel
