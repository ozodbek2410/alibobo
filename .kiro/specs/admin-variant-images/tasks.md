# Implementation Plan

- [x] 1. Backend model va API yangilash



  - Product modelida variant options uchun images array qo'shish
  - Variant bo'lmagan mahsulotlar uchun legacy support saqlash
  - Variant rasmlari yuklash uchun API endpoint yaratish
  - Rasm o'chirish uchun API endpoint yaratish



  - _Requirements: 1.1, 1.3, 2.1, 2.2_

- [ ] 2. Admin panel ImageUploader component yaratish
  - Drag & drop rasm yuklash funksiyasi


  - Rasmlarni preview qilish interfeysi
  - Rasmlarni o'chirish va tartibini o'zgartirish
  - Maksimal rasm soni cheklash (5 ta)
  - _Requirements: 2.1, 2.2, 2.3_



- [ ] 3. Admin panel VariantEditor component yaratish
  - Variant ma'lumotlarini tahrirlash interfeysi
  - ImageUploader componentini integratsiya qilish
  - Variant narxi va stock boshqarish
  - Variant o'chirish funksiyasi
  - _Requirements: 1.2, 1.3, 2.1, 2.3_



- [ ] 4. Admin panel ProductForm componentini yangilash
  - Umumiy ma'lumotlar bo'limini ajratish (nom, kategoriya, tavsif, badge)
  - "Variantlar bor" checkbox qo'shish
  - Variant bo'lsa: variantlar boshqarish bo'limini ko'rsatish


  - Variant bo'lmasa: oddiy narx, eski narx, rasmlar maydonlarini ko'rsatish
  - VariantEditor componentlarini render qilish
  - Form validation va submit logikasini yangilash
  - _Requirements: 1.1, 1.2, 1.4, 4.1_



- [ ] 5. Frontend ProductVariantSelector componentini yangilash
  - Variant tanlanganda rasm o'zgarishini trigger qilish
  - Variant rasmlarini parent componentga uzatish
  - Narx va stock yangilanishini boshqarish


  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Frontend ProductDetail componentini yangilash
  - Variant rasmlarini qabul qilish va ko'rsatish
  - ImageGallery componentini variant rasmlari bilan yangilash



  - Variant o'zgartirilganda rasmlarni yangilash logikasi
  - Placeholder rasmlar uchun fallback logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Frontend ProductCard componentini yangilash
  - Variant mavjud bo'lganda birinchi variant rasmini ko'rsatish
  - Hover effektida variant rasmlarini ko'rsatish (ixtiyoriy)
  - Responsive design uchun optimizatsiya
  - _Requirements: 3.1, 3.4_

- [ ] 8. Error handling va validation qo'shish
  - Backend'da rasm yuklash xatolari uchun error handling
  - Frontend'da form validation va user feedback
  - Network xatolari uchun retry logic
  - File size va format validation
  - _Requirements: 1.4, 2.4, 4.4_

- [ ] 9. Testing va optimization
  - Variant rasmlari yuklash va ko'rsatish testlari
  - Admin panel workflow testlari
  - Mobile responsiveness testlari
  - Performance optimization (lazy loading, image compression)
  - _Requirements: 1.1, 2.1, 3.1, 4.1_