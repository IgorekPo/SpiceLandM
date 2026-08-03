# FILE STRUCTURE

```text
SpiceLandM/
├── docs/                  # проектная документация
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── catalog-preview/ # шесть WebP-слоёв двух сцен
│   │   └── logos/
│   ├── animations/        # GSAP-сценарии
│   ├── components/        # независимые UI-компоненты
│   ├── js/                # точка входа JavaScript
│   ├── sections/          # HTML, SCSS и JS секций
│   │   ├── hero/
│   │   └── catalog-preview/
│   └── styles/
│       ├── abstracts/     # переменные и миксины
│       ├── base/          # reset, базовые стили, типографика
│       └── main.scss      # единая точка подключения
├── index.html
└── package.json
```

Новые файлы размещать по их ответственности. Не смешивать стили секций, компонентов и глобальной базы.
