# FILE STRUCTURE

```text
SpiceLandM/
├── docs/                  # проектная документация
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── js/                # JavaScript и GSAP-сценарии
│   └── scss/
│       ├── abstracts/     # переменные и миксины
│       ├── base/          # reset, базовые стили, типографика
│       ├── components/    # независимые UI-компоненты
│       ├── layout/        # каркас страницы
│       ├── sections/      # стили секций
│       └── main.scss      # единая точка подключения
├── index.html
└── package.json
```

Новые файлы размещать по их ответственности. Не смешивать стили секций, компонентов и глобальной базы.
