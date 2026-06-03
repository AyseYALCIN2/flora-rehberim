# 🌿 Flora Rehberim & Akıllı Bakım Asistanı

Flora Rehberim, doğa ve bitki severlerin kendi dijital bahçelerini kurmalarını, bitkilerinin sulama takvimlerini yönetmelerini ve akıllı bot sistemiyle anında bitki bakımı tavsiyeleri almalarını sağlayan çapraz platform (Mobil & Web) uyumlu bir uygulamadır.

Mersin Üniversitesi - Erdemli Uygulamalı Teknoloji ve İşletmecilik Yüksekokulu akademik proje geliştirme süreçleri kapsamında tasarlanmış ve geliştirilmiştir.

## 🚀 Öne Çıkan Özellikler

* **🌍 Kapsamlı Flora Rehberi:** Veritabanına kayıtlı bitkilerin mitolojik hikayelerinden, güneş ve iklim ihtiyaçlarına kadar tüm detaylı özelliklerini görüntüleme.
* **🏡 Benim Bahçem (Kişisel Takip):** Kullanıcının sahip olduğu bitkileri kendi bahçesine eklemesi ve her bitkiye özel tanımlanan periyotlarla dinamik sulama takvimi oluşturulması.
* **🤖 Flora Asistan (Yapay Zeka Destekli Bot):** Doğal Dil İşleme (NLP) mantığıyla çalışan, kelime yakalama (keyword extraction) algoritmasına sahip akıllı sohbet botu. Kullanıcının hastalık, saksı değişimi veya türe özel sulama sorularına anında yanıt verir.
* **💻 Çapraz Platform Desteği:** React Native altyapısı sayesinde uygulamanın hem iOS/Android cihazlarda hem de web tarayıcılarında sorunsuz çalışabilmesi (Tarayıcı Header ve Alert uyumlulukları sağlanmıştır).

## 🛠️ Kullanılan Teknolojiler

**Frontend (Ön Yüz):**
* React Native (Expo)
* JavaScript / ES6+
* Axios (REST API haberleşmesi)

**Backend (Arka Yüz) & Veritabanı:**
* PHP (Özel yazılmış RESTful API servisleri)
* MySQL (İlişkisel Veritabanı Mimarisi)
* XAMPP (Yerel Sunucu Ortamı)

## ⚙️ Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. **Veritabanı Kurulumu:**
   * XAMPP üzerinden Apache ve MySQL servislerini başlatın.
   * `phpMyAdmin` arayüzünden `flora_rehber` adında yeni bir veritabanı oluşturun.
   * Proje içerisindeki SQL yedeğini bu veritabanına içe aktarın (Import).

2. **API Ayarları:**
   * Backend dosyalarını (`.php` uzantılı API dosyaları ve `resimler` klasörü) `C:\xampp\htdocs\flora_api` dizinine taşıyın.

3. **Uygulamayı Başlatma:**
   * VS Code üzerinden projeyi açın ve terminalde gerekli bağımlılıkları yükleyin:
     ```bash
     npm install
     ```
   * `App.js` içerisindeki `BASE_URL` değişkenini kendi yerel IP adresinizle güncelleyin.
   * Uygulamayı Expo üzerinden başlatın:
     ```bash
     npx expo start
     ```

## 👨‍💻 Geliştirici
**Ayşe Yalçın** *Yazılım Geliştiricisi & Öğrenci*
