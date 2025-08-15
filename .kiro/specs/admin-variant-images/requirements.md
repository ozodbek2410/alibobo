# Requirements Document

## Introduction

Bu xususiyat administratorlarga mahsulot variantlari uchun alohida rasmlarni boshqarish imkonini beradi. Mahsulotlarga variantlar qo'shilganda, admin panelda yangi mahsulot qo'shish qismi o'zgaradi - bitta umumiy nom, kategoriya, tavsif va badge kiritiladi, qolgan barcha ma'lumotlar (narx, eski narx, rasmlar) har bir variant uchun alohida kiritiladi. Frontend'da variant tanlanganda, o'sha variantga tegishli rasmlar ko'rsatiladi.

## Requirements

### Requirement 1

**User Story:** Administrator sifatida, mahsulot qo'shishda umumiy ma'lumotlarni bir marta kiritib, har bir variant uchun alohida narx va rasmlarni belgilashni xohlayman, shunda mahsulotlarni samarali boshqara olaman.

#### Acceptance Criteria

1. WHEN administrator yangi mahsulot qo'shish sahifasiga kirsa THEN tizim umumiy ma'lumotlar (nom, kategoriya, tavsif, badge) va variantlar bo'limini ko'rsatishi KERAK
2. WHEN administrator umumiy ma'lumotlarni to'ldirsa THEN bu ma'lumotlar barcha variantlar uchun umumiy bo'lishi KERAK
3. WHEN administrator variant qo'shsa THEN har bir variant uchun narx, eski narx va rasmlar maydonlari ko'rsatilishi KERAK
4. WHEN administrator variant uchun bir nechta rasm yuklasa THEN bu rasmlar faqat o'sha variantga tegishli bo'lishi KERAK

### Requirement 2

**User Story:** Administrator sifatida, har bir variant uchun alohida rasmlar yuklashni xohlayman, shunda mijozlar variant tanlanganda tegishli rasmlarni ko'ra olsinlar.

#### Acceptance Criteria

1. WHEN administrator variant yaratsa THEN tizim o'sha variant uchun rasm yuklash imkonini berishi KERAK
2. WHEN administrator variant uchun rasmlar yuklasa THEN bu rasmlar faqat o'sha variantga bog'lanishi KERAK
3. WHEN administrator variantni tahrirlasa THEN mavjud rasmlarni ko'rish, qo'shish va o'chirish imkonini berishi KERAK
4. WHEN administrator variantni o'chirsa THEN o'sha variantga tegishli barcha rasmlar ham o'chirilishi KERAK

### Requirement 3

**User Story:** Mijoz sifatida, mahsulot detailida variant tanlanganda o'sha variantga tegishli rasmlarni ko'rishni xohlayman, shunda to'g'ri mahsulotni tanlashim mumkin bo'lsin.

#### Acceptance Criteria

1. WHEN mijoz mahsulot detail sahifasiga kirsa THEN birinchi variantning rasmlari sukut bo'yicha ko'rsatilishi KERAK
2. WHEN mijoz boshqa variant tanlasa THEN rasmlar o'sha variantga tegishli rasmlarga o'zgarishi KERAK
3. WHEN variant o'zgartirilsa THEN rasm gallereyasi yangi variantning rasmlariga silliq o'tish bilan yangilanishi KERAK
4. WHEN variantda rasmlar bo'lmasa THEN standart placeholder rasm ko'rsatilishi KERAK

### Requirement 4

**User Story:** Administrator sifatida, mavjud mahsulotlarga variantlar qo'shish va ularning rasmlarini boshqarishni xohlayman, shunda mahsulot katalogini yangilab turishim mumkin bo'lsin.

#### Acceptance Criteria

1. WHEN administrator mavjud mahsulotni tahrirlasa THEN variantlar bo'limini ko'rishi va tahrirlashi mumkin bo'lishi KERAK
2. WHEN administrator yangi variant qo'shsa THEN o'sha variant uchun rasmlar yuklash imkonini berishi KERAK
3. WHEN administrator variant rasmlarini o'zgartirsa THEN o'zgarishlar darhol saqlangan bo'lishi KERAK
4. WHEN administrator variantni o'chirsa THEN tasdiqlash dialog ko'rsatilishi va o'chirilgandan keyin rasmlar ham o'chirilishi KERAK