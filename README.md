# Natty Shop – Backend

Natty Shop Backend, e-ticaret odaklı bir portfolyo projesi için
geliştirilmiş RESTful API servisidir.

Kullanıcı yönetimi, ürün yönetimi, sipariş altyapısı ve admin yetkilendirme
gibi temel işlevleri kapsar.

🔗 **Canlı API:**  
https://natty-shop-backend-production.up.railway.app

---

## 🚀 Kullanılan Teknolojiler

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Railway (Deployment)

---

## 🗄️ Veritabanı

- PostgreSQL (Railway)
- Prisma ile migration & model yönetimi
- İlişkisel veri yapısı (User, Product, Order, vb.)

---

## 🔐 Kimlik Doğrulama

- JWT tabanlı authentication
- Role bazlı yapı (`user`, `admin`)
- Admin işlemleri korumalı route’lar üzerinden yapılır

---

## 📌 API Örnekleri

### Login
```http
POST /auth/login
