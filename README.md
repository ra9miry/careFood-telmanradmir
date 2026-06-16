App: https://telmanradmir.vercel.app

# careFood-telmanradmir

Краткое описание: веб-проект, развернутый и поддерживаемый через GitHub.

## Как скачать проект

### Вариант 1: через Git clone
```bash
git clone https://github.com/ra9miry/careFood-telmanradmir.git
cd careFood-telmanradmir
```

### Вариант 2: скачать ZIP
1. Открой репозиторий на GitHub.
2. Нажми **Code**.
3. Выбери **Download ZIP**.
4. Распакуй архив и открой папку проекта.

## Как запустить проект

### Если это Next.js / React-проект
```bash
npm install
npm run dev
```

После этого обычно проект открывается по адресу:
```bash
http://localhost:3000
```

### Если используется yarn
```bash
yarn

yarn dev
```

### Если используется pnpm
```bash
pnpm install
pnpm dev
```

## Как собрать проект
```bash
npm run build
npm run start
```

## Как добавить изменения в репозиторий

После того как внесены изменения в проект:

```bash
git add .
git commit -m "update project"
git push origin main
```

## Как привязать локальный проект к этому репозиторию

Если проект уже есть на компьютере, но ещё не подключён к GitHub:

```bash
cd /Users/radmirtelman/Desktop/telmanradmir
git init
git remote add origin https://github.com/ra9miry/careFood-telmanradmir.git
git add .
git commit -m "initial commit"
git branch -M main
git push -u origin main
```

## Если origin уже существует

```bash
git remote set-url origin https://github.com/ra9miry/careFood-telmanradmir.git
git push -u origin main
```

## Полезные команды

Проверить текущий remote:
```bash
git remote -v
```

Проверить статус файлов:
```bash
git status
```

Получить последние изменения:
```bash
git pull origin main
```
