# ADORE'S PET — GitHub + Supabase

এই version-এ product data ও image online database/storage-এ থাকবে।

## 1. Supabase
1. Supabase project তৈরি করুন।
2. SQL Editor-এ `supabase_setup.sql` পুরোটা চালান।
3. Authentication > Users থেকে আপনার Admin email/password user তৈরি করুন।
4. Project Settings > API থেকে Project URL এবং anon key নিন।
5. `config.js`-এ বসান:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## 2. GitHub
সব ফাইল repository-তে upload করুন।
Settings > Pages > Deploy from branch > main / root নির্বাচন করুন।

## 3. Admin
`admin.html` খুলে Supabase-এর তৈরি Admin email/password দিয়ে login করুন।
তারপর ছবি, title, description, price, stock দিয়ে product save করুন।

## গুরুত্বপূর্ণ
এটি GitHub Pages-এর জন্য প্রস্তুত frontend। Supabase এখানে database + image storage হিসেবে কাজ করে। `service_role` key কখনো `config.js`-এ দেবেন না; শুধু anon/public key ব্যবহার করবেন।
