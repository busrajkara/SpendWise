# SpendWise - Kişisel Finans Takip Uygulaması

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v18+-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-informational.svg)

**SpendWise**, harcamalarınızı ve gelirlerinizi kolayca takip etmenizi, bütçe hedefleri koymanızı ve finansal durumunuzu detaylı grafiklerle analiz etmenizi sağlayan modern bir web uygulamasıdır. Kullanıcı dostu arayüzü ve güçlü analiz araçları ile paranızın kontrolünü elinize alın.

## 🚀 Özellikler

*   **🔐 Güvenli Kimlik Doğrulama:** JWT (JSON Web Token) tabanlı güvenli giriş ve kayıt sistemi.
*   **💸 İşlem Yönetimi:** Gelir ve giderlerinizi kolayca ekleyin, düzenleyin, silin ve filtreleyin.
*   **📊 Dinamik Finansal Analiz:** Harcama dağılımınızı pasta grafikleri ve zaman içindeki trendleri alan grafikleri ile görselleştirin.
*   **💰 Bütçe Takibi:** Kategorilere özel aylık bütçe limitleri belirleyin. Harcama durumunuzu renk kodlu ilerleme çubukları ile (Yeşil, Sarı, Kırmızı) anlık takip edin.
*   **📥 Raporlama:** Tüm işlem geçmişinizi tek tıkla CSV formatında cihazınıza indirin.
*   **🌙 Modern Arayüz:** Göz yormayan, şık ve duyarlı (responsive) Karanlık Mod (Dark Mode) tasarımı.
*   **🇹🇷 Türkçe Dil Desteği:** Tamamen Türkçe kullanıcı arayüzü.

## 🛠️ Teknolojiler

Bu proje, modern ve popüler web teknolojileri kullanılarak geliştirilmiştir:

**Backend:**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   [Prisma ORM](https://www.prisma.io/)
*   [PostgreSQL](https://www.postgresql.org/)

**Frontend:**
*   [React](https://react.dev/) (Vite ile)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Recharts](https://recharts.org/) (Veri Görselleştirme)
*   [Lucide React](https://lucide.dev/) (İkonlar)
*   [Axios](https://axios-http.com/)

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Ön Hazırlık
*   Bilgisayarınızda **Node.js** ve **PostgreSQL** kurulu olmalıdır.

### 1. Backend Kurulumu

Proje ana dizininde terminali açın:

```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun ve veritabanı ayarlarınızı yapın
# Örnek .env içeriği:
# DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/spendwise_db"
# JWT_SECRET="gizli_anahtariniz"

# Veritabanı şemasını oluşturun
npx prisma migrate dev --name init

# Sunucuyu başlatın
node src/server.js
```
Backend `http://localhost:3000` adresinde çalışacaktır.

### 2. Frontend Kurulumu

Yeni bir terminal açın ve `client` klasörüne gidin:

```bash
cd client

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm run dev
```
Frontend genellikle `http://localhost:5173` adresinde çalışacaktır. Tarayıcınızda bu adresi açarak uygulamayı kullanmaya başlayabilirsiniz.

## 📸 Ekran Görüntüleri

*(Buraya uygulama ekran görüntüleri eklenecektir)*

---

## 👤 Yazar

**busrajkara**

---
*SpendWise ile harcamalarınızı akıllıca yönetin!* 🚀