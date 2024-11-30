### решение ДЗ:

Доброго времени суток!

Для решения этого ДЗ использовал паттерн Сага + хореография. Микрофсервисы осведомлены через общий интерфейс о данных саги и возможных сообщениях отправляющего сервиса. Сервисы сами решают на какой событие подписываться.

Ключевое событие и общее для всех "заинтересованных", это "order-saga--compensation", которое может также вызвать любой микросервис, если понимает, что данные order-saga не валидны или произошли необратимые изменения за время обработки транзакции другими сервисами (например, товар кончился, пока пользователь оформлял корзину)

Во всех случаях сервисы, которые сделали изменения в своих БД при событии "order-saga--compensation" откатят свои изменения для конкретного заказа, который указан в order-saga данных. - все откаты саги идемпотенты, то есть не уйдет лишняя резервация и биллинг сервис не компенсирует деньги дважды и более раз.

Сделал 2 основных набора тестов: положительные тесты для заказа и тесты с ошибкой последнего шага саги (пример, определение ошибочного времени для курьера). Для других случаев тоже мог бы сделать, но везде суть одна: сработает компенсация саги и проверка будет аналогичная тому, что если сага упадет на последнем шаге - я просто засорю большим количеством копипастов.

### Архитектура:

Нарисовал уровень контейнеров <a name="my-scrinshot">🔗</a>:

#### Что нужно ддля запуска:

- Minikube (также включить ingress addon)
- Helm
- Newman (тестирование запущенного приложения)

#### Начинаем:

(-1) Не забудь запустить minikube: `minikube start`

(0) работаем из директории homework-8: `cd ./homework-8` ... если вы не в ней

(1) Устанавливаем наш хелм чарт , который имеет в себе инструкции по запуску нашего приложения (неймспейс `homework-8-saga`):

```bash
helm upgrade homework-8-saga --install --create-namespace --namespace=homework-8-saga ./app
```

(1.1) Дамашняя работа в неймспейсе `homework-8-saga`, поэтому сменим неймспейс, если будете пользоваться kubectl, minikube или helm:  
`kubectl config set-context --current --namespace=homework-8-saga`

(2) Не забываем включить тунель в отдельном окне терминала и настроить hosts:

```bash
minikube tunnel
```

(3) Теперь Newman поможет протестировать коллекцию Postman, которая ссылается на наше локальное приложение (`--verbose` для отображения деталей):

```bash
newman run otus-homework-8-saga.postman_collection.json --verbose
```

Ниже вот такие логи у меня локально :

```
PS C:\code\otus-homework\homework-8> newman run otus-homework-8-saga.postman_collection.json --verbose
newman

otus-homework-8-saga

→ Get products list
  GET http://arch.homework/warehouse/products
  200 OK ★ 18ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999993},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait   dns-lookup   tcp-handshake   transfer-start   download   process   total
  22ms      6ms    1ms          455µs           4ms              5ms        1ms       40ms

  √  Successful Get get public products list

→ Register
  POST http://arch.homework/user/register
  201 Created ★ 70ms time ★ 393B↑ 354B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 101B
  │ {
  │   "username": "Callie27",
  │   "email": "Nicholaus_Rowe@gmail.com",
  │   "password": "!vNgznNVpJy0H3m1"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 136B
  │ {"username":"Callie27","email":"Nicholaus_Rowe@gmail.com","avatarUrl":null,"id":11,"createdAt":"2024-11-30T14:28:05.709Z","role":"USER"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       567µs   (cache)      (cache)         67ms             1ms        248µs     70ms

  √  Successful POST create user

→ Login
  POST http://arch.homework/auth/login
  200 OK ★ 109ms time ★ 365B↑ 538B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 77B
  │ {
  │     "email": "Nicholaus_Rowe@gmail.com",
  │   "password": "!vNgznNVpJy0H3m1"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":11,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3MzI5NzY4ODUsImV4cCI6MTczMjk3NzE4NX0.TcuR4kkoSbNMBMDO-vQO-buSX9oPTE_DM_8N9RnDtuY","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3MzI5NzY4ODUsImV4cCI6MTczMzA2MzI4NX0.T48G0E5kIP2ab3pDY6rgbCik5TCSZfWq4DYIti4I1g0"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  957µs     193µs   (cache)      (cache)         107ms            1ms        97µs      109ms

  √  Successful POST login

→ Get User initital Billing data
  GET http://arch.homework/billing/user
  200 OK ★ 9ms time ★ 401B↑ 234B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 22B
  │ {"userId":11,"bill":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  965µs     183µs   (cache)      (cache)         6ms              1ms        88µs      9ms

  √  Successful Get User's initital billing data

→ Top Up User's Bill
  POST http://arch.homework/billing/user/top-up-bill
  201 Created ★ 29ms time ★ 488B↑ 242B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 22B
  │ {
  │     "bill": 2000
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":11,"bill":2000}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  931µs     190µs   (cache)      (cache)         27ms             1ms        99µs      29ms

  √  Successful top up user's bill

→ Make Wrong Time Order
  POST http://arch.homework/order/user/make-order
  201 Created ★ 26ms time ★ 559B↑ 367B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 96B
  │ {"cost":100,"data":{"products":[{"productId":1,"count":1,"cost":100}],"courierTime":1731976886}}
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 149B
  │ {"userId":11,"cost":100,"data":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}],\"courierTime\":1731976886}","id":16,"payed":0,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  771µs     184µs   (cache)      (cache)         23ms             1ms        86µs      26ms

  √  Successful Create User's chip order

→ Get User Billing data After Wrong Time order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 237B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":11,"bill":2000}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  788µs     151µs   (cache)      (cache)         6ms              1ms        87µs      8ms

  √  Wrong order cannot change user's bill

→ Get user notifications After Wrong Time order
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 8ms time ★ 420B↑ 365B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 152B
  │ [{"id":24,"userId":11,"type":"success","text":"Your bill is compensated"},{"id":23,"userId":11,"type":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  906µs     154µs   (cache)      (cache)         6ms              1ms        115µs     8ms

  √  Last User notifactions has messages about bill restored, and successfull pay before it

→ Get user payments After Wrong Time order
  GET http://arch.homework/payment/user/payments
  200 OK ★ 8ms time ★ 410B↑ 258B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 46B
  │ [{"id":14,"userId":11,"orderId":16,"payed":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       208µs   (cache)      (cache)         6ms              1ms        146µs     8ms

  √  Wrong order is not payed as result

→ Get user reserved products After Wrong Time order
  GET http://arch.homework/warehouse/user/reserved-products/16
  200 OK ★ 8ms time ★ 424B↑ 212B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 2B
  │ []
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  809µs     242µs   (cache)      (cache)         5ms              994µs      74µs      8ms

  √  Should be empty reserved products

→ Get user reserved couriers After Wrong Time order
  GET http://arch.homework/delivery/user/reserved-couriers/16
  200 OK ★ 9ms time ★ 423B↑ 212B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 2B
  │ []
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  844µs     210µs   (cache)      (cache)         7ms              966µs      97µs      9ms

  √  It shoult be empty reserved couriers to order

→ Get products list After Wrong Time order
  GET http://arch.homework/warehouse/products
  200 OK ★ 4ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999993},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  821µs     152µs   (cache)      (cache)         2ms              804µs      121µs     4ms

  √  After wrong order products count shoul be the same

→ Get products list
  GET http://arch.homework/warehouse/products
  200 OK ★ 4ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999993},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  750µs     278µs   (cache)      (cache)         2ms              852µs      90µs      4ms

  √  Successful Get get public products list (+reset globals)

→ Make Common Order
  POST http://arch.homework/order/user/make-order
  201 Created ★ 26ms time ★ 559B↑ 367B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 96B
  │ {"cost":100,"data":{"products":[{"productId":1,"count":1,"cost":100}],"courierTime":1733976887}}
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 149B
  │ {"userId":11,"cost":100,"data":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}],\"courierTime\":1733976887}","id":17,"payed":0,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  738µs     248µs   (cache)      (cache)         23ms             1ms        242µs     26ms

  √  Successful Create User's chip order

→ Get User Billing data After Chip order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 237B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":11,"bill":1900}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  710µs     168µs   (cache)      (cache)         6ms              885µs      124µs     7ms

  √  Successful Get User's billing data after chip order

→ Get user notifications
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 9ms time ★ 420B↑ 443B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 230B
  │ [{"id":25,"userId":11,"type":"success","text":"Successfully payid your order"},{"id":24,"userId":11,"type":"success","text":"Your bill is compensated"},{"id":23,"userId":11,"t
  │ ype":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  836µs     164µs   (cache)      (cache)         6ms              929µs      87µs      8ms

  √  Last User notifaction ihas success message after chip order

→ Get user payments
  GET http://arch.homework/payment/user/payments
  200 OK ★ 8ms time ★ 410B↑ 303B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 91B
  │ [{"id":15,"userId":11,"orderId":17,"payed":1},{"id":14,"userId":11,"orderId":16,"payed":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  813µs     170µs   (cache)      (cache)         6ms              905µs      61µs      8ms

  √  Chip order has payed payment

→ Get user reserved products
  GET http://arch.homework/warehouse/user/reserved-products/17
  200 OK ★ 8ms time ★ 424B↑ 283B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 71B
  │ [{"id":15,"userId":11,"orderId":17,"productId":1,"count":1,"cost":100}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  799µs     209µs   (cache)      (cache)         6ms              1ms        179µs     8ms

  √  User has reserved products

→ Get user reserved couriers
  GET http://arch.homework/delivery/user/reserved-couriers/17
  200 OK ★ 8ms time ★ 423B↑ 279B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 67B
  │ [{"id":7,"userId":11,"orderId":17,"courierId":1,"time":1733976887}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  773µs     177µs   (cache)      (cache)         6ms              821µs      59µs      7ms

  √  User should have reserved courier

→ Get products list after normal order
  GET http://arch.homework/warehouse/products
  200 OK ★ 4ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999992},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       139µs   (cache)      (cache)         2ms              773µs      64µs      4ms

  √  Successful decrement product's count

┌─────────────────────────┬────────────────────┬───────────────────┐
│                         │           executed │            failed │
├─────────────────────────┼────────────────────┼───────────────────┤
│              iterations │                  1 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│                requests │                 20 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│            test-scripts │                 20 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│      prerequest-scripts │                 13 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│              assertions │                 20 │                 0 │
├─────────────────────────┴────────────────────┴───────────────────┤
│ total run duration: 2.5s                                         │
├──────────────────────────────────────────────────────────────────┤
│ total data received: 1.94kB (approx)                             │
├──────────────────────────────────────────────────────────────────┤
│ average response time: 19ms [min: 4ms, max: 109ms, s.d.: 25ms]   │
├──────────────────────────────────────────────────────────────────┤
│ average DNS lookup time: 1ms [min: 1ms, max: 1ms, s.d.: 0µs]     │
├──────────────────────────────────────────────────────────────────┤
│ average first byte time: 16ms [min: 2ms, max: 107ms, s.d.: 25ms] │
└──────────────────────────────────────────────────────────────────┘
```
