#### Что нужно ддля запуска:

- Minikube (также включить ingress addon)
- Helm
- Newman (тестирование запущенного приложения)

#### Начинаем:

(0) Не забудь запустить minikube: `minikube start`

(1) Устанавливаем наш хелм чарт , который имеет в себе инструкции по запуску нашего приложения (неймспейс `homework-6`):

```bash
helm upgrade app --install --create-namespace --namespace=homework-6 ./app
```

(1.1) Дамашняя работа в неймспейсе `homework-6`, поэтому сменим неймспейс, если будете пользоваться kubectl: `kubectl config set-context --current --namespace=homework-6`

(2) Не забываем включить тунель в отдельном окне терминала и настроить hosts:

```bash
minikube tunnel
```

(3) Теперь Newman поможет протестировать коллекцию Postman, которая ссылается на наше локальное приложение (`--verbose` для отображения деталей):

```bash
newman run otus-homework-6.postman_collection.json --verbose
```

```bash
newman run otus-homework-6.postman_collection.json --verbose -r html,cli,json,junit --reporter-json-export verbose-report.json
```

<a name="my-scrinshot">у меня такие логи</a>, надеюсь, что у вас такие же:

---
