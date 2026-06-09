# QRMenuApp

React ve Laravel kullanılarak geliştirilmiş QR kod tabanlı kafe menü ve sipariş sistemidir.

## Proje Hakkında

Bu uygulama, kafe ve restoranlarda müşterilerin masa üzerindeki QR kodu okutarak dijital menüye erişmesini ve sipariş vermesini sağlar.

Müşteri tarafında ürünler kategorilere göre listelenir, ürünlere ekstra seçenekler eklenebilir ve sipariş oluşturulabilir.

Mutfak tarafında ise gelen siparişler görüntülenebilir ve sipariş durumları güncellenebilir.

## Kullanılan Teknolojiler

### Frontend

* React 19
* Vite
* Tailwind CSS

### Backend

* Laravel 12
* PHP 8.2+
* MySQL

## Temel Özellikler

* QR kod ile masa tanıma
* Dijital menü görüntüleme
* Ürün ve ekstra seçenekleri
* Sepet ve sipariş oluşturma
* Mutfak ekranı
* Sipariş durum güncelleme
* REST API mimarisi

## Proje Yapısı

```text
QRMenuApp
│
├── src/                       # React frontend
├── public/
│
├── location-waffle-backend/   # Laravel backend
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
│
├── package.json
└── README.md
```

## Kurulum

### Backend

```bash
cd location-waffle-backend

composer install

copy .env.example .env

php artisan key:generate

php artisan migrate:fresh --seed

php artisan serve
```

Backend varsayılan olarak aşağıdaki adreste çalışır:

```text
http://127.0.0.1:8000
```

### Frontend

Proje ana dizininde:

```bash
npm install

npm run dev
```

Frontend varsayılan olarak aşağıdaki adreste çalışır:

```text
http://localhost:5173
```

## Test URL'leri

### Müşteri Ekranı

```text
http://localhost:5173/?masa=masa-01
```

### Mutfak Ekranı

```text
http://localhost:5173/kitchen
```

## API Uç Noktaları

| Metot | Endpoint         | Açıklama                  |
| ----- | ---------------- | ------------------------- |
| GET   | /api/menu        | Menü verileri             |
| GET   | /api/tables      | Masa bilgileri            |
| GET   | /api/orders      | Aktif siparişler          |
| POST  | /api/orders      | Yeni sipariş oluştur      |
| PATCH | /api/orders/{id} | Sipariş durumunu güncelle |

## Geliştirici

Sedef Beysan

Bilgisayar Mühendisliği Görsel Programlama Projesi
