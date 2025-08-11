# Design Document

## Overview

Данный документ описывает дизайн решения для унификации цвета фона карточек товаров в компоненте ProductsGrid. Цель - создать визуально согласованный интерфейс, где фон карточки товара соответствует фону изображения товара.

## Architecture

### Компоненты для изменения:
- `ProductsGrid.jsx` - основной компонент с карточками товаров
- CSS стили для карточек товаров
- Skeleton loader компонент для состояния загрузки

### Подход к решению:
1. **Унификация цвета фона**: Использовать единый нейтральный цвет для всех карточек
2. **Стандартизация изображений**: Обеспечить одинаковый фон для всех изображений товаров
3. **Консистентность в состояниях**: Применить тот же цвет для всех состояний карточки

## Components and Interfaces

### ProductsGrid Component

```jsx
// Обновленная структура карточки товара
const createProductCard = (product) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative bg-gray-50"> {/* Унифицированный фон */}
        <img 
          src={product.image || '/assets/default-product.png'} 
          alt={product.name} 
          className="w-full h-56 object-contain" {/* object-contain вместо object-cover */}
        />
        {/* Badges и другие элементы */}
      </div>
      {/* Остальное содержимое карточки */}
    </div>
  );
};
```

### CSS Стили

```css
/* Унифицированный фон для изображений товаров */
.product-image-container {
  background-color: #f9fafb; /* gray-50 */
}

/* Skeleton loader с тем же фоном */
.skeleton-image {
  background-color: #f9fafb; /* gray-50 */
}
```

## Data Models

### Product Image Styling
- **Фон контейнера**: `bg-gray-50` (#f9fafb)
- **Режим отображения изображения**: `object-contain` для сохранения пропорций
- **Размеры**: Фиксированная высота с адаптивной шириной

### Color Scheme
- **Основной фон карточки**: `bg-white` (#ffffff)
- **Фон изображения**: `bg-gray-50` (#f9fafb)
- **Граница карточки**: `border-gray-200` (#e5e7eb)

## Error Handling

### Отсутствующие изображения
- Использовать placeholder изображение с тем же фоном
- Показывать иконку по умолчанию на сером фоне

### Ошибки загрузки изображений
- Fallback на стандартный серый фон
- Показывать иконку ошибки в центре

## Testing Strategy

### Visual Testing
1. Проверить единообразие фона во всех карточках
2. Убедиться в корректном отображении на разных размерах экрана
3. Проверить состояние загрузки (skeleton)

### Cross-browser Testing
1. Тестирование в Chrome, Firefox, Safari
2. Проверка на мобильных устройствах
3. Валидация цветов в разных браузерах

### Accessibility Testing
1. Проверить контрастность цветов
2. Убедиться в читаемости текста на новом фоне
3. Валидация с screen readers

## Implementation Details

### Изменения в ProductsGrid.jsx:
1. Обновить className для контейнера изображения
2. Изменить `object-cover` на `object-contain`
3. Унифицировать фон для всех состояний карточки

### Изменения в skeleton loader:
1. Использовать тот же цвет фона `bg-gray-50`
2. Обеспечить визуальную согласованность

### CSS оптимизации:
1. Добавить переходы для плавности
2. Оптимизировать для производительности
3. Обеспечить responsive дизайн