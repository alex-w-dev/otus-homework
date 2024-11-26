### Архитектура:

Вот описание архитектуры:  
Nginx выступает в роли API Gateway, настроен следующим образом: есть публичные эндпониты в которых нет нужды проверять пользователя на аунтентифицированность, и есть защищенные эндпоинты (все остальные), где nginx обращается к сервису авторизация для проверки заголовка Authorization , если авторизационыый сервис возврашает ОК, то запрос пропускается в другой микросервис, если 401, то nginx выдает 401 ошибку. Нарисовал уровень кнтейнеров и компоенентов <a name="my-scrinshot">🔗</a>:
![c4 container](image.png)
![c4 component Api Gateway](image-2.png)

#### Что нужно ддля запуска:

- Minikube (также включить ingress addon)
- Helm
- Newman (тестирование запущенного приложения)

#### Начинаем:

(0) Не забудь запустить minikube: `minikube start`

(1) Устанавливаем наш хелм чарт , который имеет в себе инструкции по запуску нашего приложения (неймспейс `homework-7-billing`):

```bash
helm upgrade homework-7-billing --install --create-namespace --namespace=homework-7-billing ./app --set "development.enabled=true"
```

(1.0) Убедиться, что все стартануло, можно командой `kubectl get po -n homework-7-billing` - 2 пода должны быть READY (напоминаю что другие сервисы подключу позднее, когда нужно будет расширять приложение)

(1.1) Дамашняя работа в неймспейсе `homework-7-billing`, поэтому сменим неймспейс, если будете пользоваться kubectl: `kubectl config set-context --current --namespace=homework-7-billing`

(2) Не забываем включить тунель в отдельном окне терминала и настроить hosts:

```bash
minikube tunnel
```

(3) Теперь Newman поможет протестировать коллекцию Postman, которая ссылается на наше локальное приложение (`--verbose` для отображения деталей):

```bash
newman run otus-homework-7-billing.postman_collection.json --verbose
```

Ниже вот такие логи у меня локально:

```
PS C:\code\otus-homework\homework-7> newman run otus-homework-7-billing.postman_collection.json --verbose
newman

otus-homework-7-billing

→ Register
  POST http://arch.homework/user/register
  201 Created ★ 95ms time ★ 385B↑ 347B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 94B
  │ {
  │   "username": "Titus98",
  │   "email": "Dolly2@hotmail.com",
  │   "password": "!1R7UpJ2CNihBvS1"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 129B
  │ {"username":"Titus98","email":"Dolly2@hotmail.com","avatarUrl":null,"id":54,"createdAt":"2024-11-26T06:46:47.706Z","role":"USER"}
  └
  prepare   wait   dns-lookup   tcp-handshake   transfer-start   download   process   total
  19ms      6ms    925µs        421µs           81ms             5ms        919µs     115ms

  √  Successful POST create user

→ Login
  POST http://arch.homework/auth/login
  200 OK ★ 107ms time ★ 359B↑ 538B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 71B
  │ {
  │     "email": "Dolly2@hotmail.com",
  │   "password": "!1R7UpJ2CNihBvS1"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":54,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU0LCJpYXQiOjE3MzI2MDM2MDcsImV4cCI6MTczMjYwMzkwN30.7sh5deXYtd4YIeQYbmt-zuI5eL_nmKMJkW5wDD_A0xA","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU0LCJpYXQiOjE3MzI2MDM2MDcsImV4cCI6MTczMjY5MDAwN30.Ukgm-BehlT1vX8k6aheom6I-dfG2sUEoilGMHBcx-aI"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  904µs     427µs   (cache)      (cache)         104ms            1ms        109µs     107ms

  √  Successful POST login

→ Get User initital Billing data
  GET http://arch.homework/billing/user
  200 OK ★ 9ms time ★ 401B↑ 234B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 22B
  │ {"userId":54,"bill":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  861µs     261µs   (cache)      (cache)         7ms              1ms        140µs     9ms

  √  Successful Get User's initital billing data

→ Top Up User's Bill
  POST http://arch.homework/billing/user/top-up-bill
  201 Created ★ 24ms time ★ 487B↑ 241B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 21B
  │ {
  │     "bill": 200
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 24B
  │ {"userId":54,"bill":200}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  897µs     190µs   (cache)      (cache)         22ms             1ms        84µs      24ms

  √  Successful top up user's bill

→ Make Chip Order
  POST http://arch.homework/order/user/make-order
  201 Created ★ 40ms time ★ 484B↑ 270B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 21B
  │ {
  │     "cost": 150
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 53B
  │ {"userId":54,"cost":150,"id":46,"payed":0,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  840µs     233µs   (cache)      (cache)         37ms             1ms        95µs      39ms

  √  Successful Create User's chip order

→ Get User Billing data After Chip order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 235B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 23B
  │ {"userId":54,"bill":50}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  728µs     180µs   (cache)      (cache)         6ms              902µs      155µs     8ms

  √  Successful Get User's billing data after chip order

→ Get user notifications
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 9ms time ★ 420B↑ 291B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 79B
  │ [{"id":23,"userId":54,"type":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  831µs     182µs   (cache)      (cache)         7ms              981µs      81µs      9ms

  √  Last User notifaction ihas success message after chip order

→ MakeExpensive Order
  POST http://arch.homework/order/user/make-order
  201 Created ★ 43ms time ★ 485B↑ 271B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 22B
  │ {
  │     "cost": 9999
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 54B
  │ {"userId":54,"cost":9999,"id":47,"payed":0,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       207µs   (cache)      (cache)         40ms             1ms        145µs     43ms

  √  Successful Create User's expensive order

→ Get User Billing data After Expensive order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 235B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 23B
  │ {"userId":54,"bill":50}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  835µs     214µs   (cache)      (cache)         6ms              1ms        70µs      8ms

  √  Should not change User's bill after expensive order

→ Get user notifications after Expensive order
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 8ms time ★ 420B↑ 359B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 146B
  │ [{"id":24,"userId":54,"type":"error","text":"Not payed your order"},{"id":23,"userId":54,"type":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  769µs     273µs   (cache)      (cache)         6ms              960µs      74µs      8ms

  √  Last User notifaction has ERROR message after chip order

┌─────────────────────────┬─────────────────────┬────────────────────┐
│                         │            executed │             failed │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              iterations │                   1 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│                requests │                  10 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│            test-scripts │                  10 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│      prerequest-scripts │                   5 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              assertions │                  10 │                  0 │
├─────────────────────────┴─────────────────────┴────────────────────┤
│ total run duration: 1677ms                                         │
├────────────────────────────────────────────────────────────────────┤
│ total data received: 877B (approx)                                 │
├────────────────────────────────────────────────────────────────────┤
│ average response time: 35ms [min: 8ms, max: 107ms, s.d.: 35ms]     │
├────────────────────────────────────────────────────────────────────┤
│ average DNS lookup time: 925µs [min: 925µs, max: 925µs, s.d.: 0µs] │
├────────────────────────────────────────────────────────────────────┤
│ average first byte time: 32ms [min: 6ms, max: 104ms, s.d.: 33ms]   │
└────────────────────────────────────────────────────────────────────┘
```
