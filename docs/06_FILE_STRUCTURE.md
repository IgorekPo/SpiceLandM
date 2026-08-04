# FILE STRUCTURE

```text
SpiceLandM/
├── .github/
│   └── workflows/         # автоматическая сборка и публикация GitHub Pages
├── docs/                  # проектная документация
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── catalog-preview/ # шесть WebP-слоёв двух сцен
│   │   │   ├── marinades/       # текстуры рідких і сухих маринадів
│   │   │   └── dishes/          # фото готових страв для галерей
│   │   └── logos/
│   ├── animations/        # GSAP-сценарии и общий контроллер device-tilt.js
│   ├── components/        # независимые UI-компоненты, включая корзину и модальные окна
│   ├── data/              # единый источник данных товаров
│   ├── js/                # точка входа JavaScript и store корзины
│   ├── sections/          # HTML, SCSS и JS секций
│   │   ├── hero/
│   │   ├── catalog-preview/
│   │   └── catalog/
│   └── styles/
│       ├── abstracts/     # переменные и миксины
│       ├── base/          # reset, базовые стили, типографика
│       └── main.scss      # единая точка подключения
├── index.html
└── package.json
```

Новые файлы размещать по их ответственности. Не смешивать стили секций, компонентов и глобальной базы.
