# Requirements Document

## Introduction

Foydalanuvchi sahifaga birinchi marta kirganda mahsulotlar yuklanayotgan vaqtda skeleton loader ko'rsatish kerak. Hozirda foydalanuvchi bir necha sekund bo'sh sahifani ko'radi, keyin mahsulotlar paydo bo'ladi. Bu yomon foydalanuvchi tajribasi yaratadi va sahifa ishlamayotgandek tuyuladi.

## Requirements

### Requirement 1

**User Story:** Foydalanuvchi sifatida, sahifaga birinchi marta kirganimda mahsulotlar yuklanayotganini ko'rish uchun skeleton loader ko'rishni xohlayman, shunda sahifa ishlab turganini bilaman.

#### Acceptance Criteria

1. WHEN foydalanuvchi sahifaga birinchi marta kiradi THEN tizim skeleton loader ko'rsatishi KERAK
2. WHEN mahsulotlar API dan yuklanayotgan bo'lsa THEN skeleton loader ko'rsatilishi KERAK
3. WHEN mahsulotlar muvaffaqiyatli yuklandi THEN skeleton loader yo'qolishi va haqiqiy mahsulotlar ko'rsatilishi KERAK
4. WHEN API xatolik qaytarsa THEN skeleton loader yo'qolishi va xatolik xabari ko'rsatilishi KERAK

### Requirement 2

**User Story:** Foydalanuvchi sifatida, skeleton loader haqiqiy mahsulot kartalariga o'xshashini xohlayman, shunda nima yuklanayotganini tushunaman.

#### Acceptance Criteria

1. WHEN skeleton loader ko'rsatilayotgan bo'lsa THEN u haqiqiy mahsulot kartalari bilan bir xil o'lchamda bo'lishi KERAK
2. WHEN skeleton loader ko'rsatilayotgan bo'lsa THEN u grid layoutda joylashishi KERAK
3. WHEN skeleton loader ko'rsatilayotgan bo'lsa THEN u rasm, nom, narx va tugma joylarini ko'rsatishi KERAK
4. WHEN skeleton loader ko'rsatilayotgan bo'lsa THEN u animatsiya bilan pulsatsiya qilishi KERAK

### Requirement 3

**User Story:** Foydalanuvchi sifatida, kategoriya yoki qidiruv o'zgarganda ham skeleton loader ko'rishni xohlayman, shunda yangi natijalar yuklanayotganini bilaman.

#### Acceptance Criteria

1. WHEN foydalanuvchi kategoriyani o'zgartirsa THEN yangi mahsulotlar yuklanayotganda skeleton loader ko'rsatilishi KERAK
2. WHEN foydalanuvchi qidiruv so'rovi kiritsa THEN qidiruv natijalari yuklanayotganda skeleton loader ko'rsatilishi KERAK
3. WHEN filtrlar o'zgartirilsa THEN yangi natijalar yuklanayotganda skeleton loader ko'rsatilishi KERAK
4. WHEN API javob berish sekin bo'lsa THEN skeleton loader ko'rsatilishda davom etishi KERAK

### Requirement 4

**User Story:** Foydalanuvchi sifatida, skeleton loader responsive bo'lishini xohlayman, shunda barcha qurilmalarda to'g'ri ko'rinsin.

#### Acceptance Criteria

1. WHEN skeleton loader mobil qurilmada ko'rsatilsa THEN 2 ustunli grid ko'rsatilishi KERAK
2. WHEN skeleton loader planshetda ko'rsatilsa THEN 3 ustunli grid ko'rsatilishi KERAK
3. WHEN skeleton loader desktopda ko'rsatilsa THEN 4 ustunli grid ko'rsatilishi KERAK
4. WHEN skeleton loader ko'rsatilsa THEN kategoriya navigatsiya va filtr qismlari ham skeleton ko'rinishida bo'lishi KERAK