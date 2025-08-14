# Requirements Document

## Introduction

Telefon versiyasida foydalanuvchilar mahsulotlarni kategoriyalar bo'yicha oson filtrlash imkoniyatiga ega bo'lishi kerak. Hozirda kategoriyalar faqat desktop versiyada mavjud, lekin mobil foydalanuvchilar uchun ham bu funksiya juda muhim.

## Requirements

### Requirement 1

**User Story:** Mobil foydalanuvchi sifatida, men mahsulotlar sahifasida kategoriyalarni ko'rishni va tanlashni xohlayman, shunda kerakli mahsulotlarni tezroq topishim mumkin bo'ladi.

#### Acceptance Criteria

1. WHEN foydalanuvchi mobil qurilmada mahsulotlar sahifasini ochsa THEN tizim kategoriyalar ro'yxatini ko'rsatishi KERAK
2. WHEN foydalanuvchi kategoriyani tanlasa THEN tizim faqat o'sha kategoriyaga tegishli mahsulotlarni ko'rsatishi KERAK
3. WHEN foydalanuvchi "Hammasi" kategoriyasini tanlasa THEN tizim barcha mahsulotlarni ko'rsatishi KERAK

### Requirement 2

**User Story:** Mobil foydalanuvchi sifatida, men tanlangan kategoriyani aniq ko'rishni xohlayman, shunda qaysi filtr qo'llanganini bilishim mumkin bo'ladi.

#### Acceptance Criteria

1. WHEN foydalanuvchi kategoriyani tanlasa THEN tizim tanlangan kategoriyani vizual jihatdan ajratib ko'rsatishi KERAK
2. WHEN foydalanuvchi boshqa kategoriyaga o'tsa THEN tizim oldingi tanlovni olib tashlashi va yangi tanlovni belgilashi KERAK

### Requirement 3

**User Story:** Mobil foydalanuvchi sifatida, men kategoriyalar ro'yxati sahifaning boshqa qismlariga to'sqinlik qilmasligini xohlayman, shunda qulay foydalanish tajribasi bo'ladi.

#### Acceptance Criteria

1. WHEN kategoriyalar ko'rsatilsa THEN ular sahifaning boshqa elementlariga to'sqinlik qilmasligi KERAK
2. WHEN foydalanuvchi kategoriyalar orasida harakatlansa THEN bu jarayon silliq va tez bo'lishi KERAK
3. WHEN kategoriyalar juda ko'p bo'lsa THEN ular gorizontal scroll bilan ko'rsatilishi KERAK