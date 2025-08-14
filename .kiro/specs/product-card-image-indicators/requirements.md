# Requirements Document

## Introduction

Bu spec product card'larda hover orqali rasm o'zgarganda foydalanuvchiga qaysi rasm ko'rsatilayotganini bildirish uchun visual indicator (chiziq yoki nuqtalar) qo'shish haqida. Bu foydalanuvchi tajribasini yaxshilaydi va rasmlar orasida navigatsiya qilishni osonlashtiradi.

## Requirements

### Requirement 1

**User Story:** Foydalanuvchi sifatida, mahsulot kartochkasida hover qilganimda qaysi rasm ko'rsatilayotganini bilish uchun visual indicator ko'rishni xohlayman.

#### Acceptance Criteria

1. WHEN foydalanuvchi mahsulot kartochkasida hover qilsa THEN rasmning tagida progress indicator ko'rinishi KERAK
2. WHEN bir nechta rasm mavjud bo'lsa THEN har bir rasm uchun alohida indicator ko'rinishi KERAK
3. WHEN hozirgi rasm ko'rsatilayotgan bo'lsa THEN tegishli indicator active holatda (to'q sariq rangda) bo'lishi KERAK
4. WHEN boshqa rasmlar mavjud bo'lsa THEN ularning indicatorlari inactive holatda (kulrang rangda) bo'lishi KERAK

### Requirement 2

**User Story:** Foydalanuvchi sifatida, indicator'larga bosib to'g'ridan-to'g'ri kerakli rasmga o'tishni xohlayman.

#### Acceptance Criteria

1. WHEN foydalanuvchi indicator'ga bosganda THEN tegishli rasm ko'rsatilishi KERAK
2. WHEN indicator bosilganda THEN boshqa hover eventlar to'xtatilishi KERAK
3. WHEN indicator bosilganda THEN card'ning boshqa qismlariga ta'sir qilmasligi KERAK

### Requirement 3

**User Story:** Mobile foydalanuvchi sifatida, touch orqali rasmlar orasida navigatsiya qilganimda ham indicator'larni ko'rishni xohlayman.

#### Acceptance Criteria

1. WHEN mobile qurilmada touch qilinganda THEN indicator'lar ko'rinishi KERAK
2. WHEN touch orqali rasm o'zgarganda THEN indicator ham yangilanishi KERAK
3. WHEN bitta rasm bo'lsa THEN indicator ko'rsatilmasligi KERAK

### Requirement 4

**User Story:** Foydalanuvchi sifatida, indicator'lar kartochka dizayniga mos kelishi va chalg'itmasligi kerak.

#### Acceptance Criteria

1. WHEN indicator'lar ko'rsatilganda THEN ular kartochka dizayniga mos kelishi KERAK
2. WHEN indicator'lar ko'rsatilganda THEN ular rasm ustida minimal joy egallashi KERAK
3. WHEN hover qilinmaganda THEN desktop'da indicator'lar yashirinishi KERAK (mobile'da doimo ko'rinadi)
4. WHEN indicator'lar ko'rsatilganda THEN ular to'q sariq (#F68622) va kulrang ranglardan foydalanishi KERAK

### Requirement 5

**User Story:** Foydalanuvchi sifatida, indicator'lar responsive bo'lishi va barcha qurilmalarda yaxshi ishlashi kerak.

#### Acceptance Criteria

1. WHEN kichik ekranlarda ko'rilganda THEN indicator'lar mos o'lchamda bo'lishi KERAK
2. WHEN katta ekranlarda ko'rilganda THEN indicator'lar hover'da ko'rinishi KERAK
3. WHEN mobile qurilmalarda THEN indicator'lar doimo ko'rinishi KERAK
4. WHEN indicator'lar ko'rsatilganda THEN ular touch-friendly o'lchamda bo'lishi KERAK