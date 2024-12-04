### решение ДЗ:

Доброго времени суток!  
Вот мой рецепт идемпотентности для заказа:

1. HTTP метод создания идемпотентен:

   - первый вызов создает заказ
   - второй упадет с ошибкой "такой заказ уже существует", если все данные заказа (продукты, курьер, место выдачи и пр.) идентичны существуюущему в БД (проверяются заказы "моложе" 10 минут), но что если клиент действительно хочет дублировать заказ? вот ответ:
     - если передать doubleAccepted в теле запроса, то проверка не будет проведена, но это должно быть реализовано на клиенте: подтверждение "подобный заказ уже создан, создать новый?"
     - если сделать заказ позднее 10 минут* с аналогичными данными, то будет создан второй заказ с аналогичными параметрами без "предупреждения".  
       *Время взято примерное, можно заменить на 1 час, например.

2. Все подписчики событий саги реализуют идемпотентность без вызова ошибки (компенсации саги не будет, если сообщение выполняется не первый раз). <strong>Ключем идемпотентности явлется orderId</strong>.

   - Каждый сервис обрабатывающий сагу, сперва проверяет наличие записей внутри себя отностильно orderId: если записи есть, то ничего не происходит, событие пробрасывается дальше.
   - И даже если у нас будет "зомби", то мы успешно пройдемся, хоть 10 раз, по саге и результат будет 1 - тот который первый обновил БД.
   - Случай "компенсации саги" и затем заупуска её снова, также предусматривается: события не пробрасываются.
   - Параллельный вызов обработчиков также фиксирован транзакциями в БД.
   - Аналогично и компенсация саги не проходит дважды.

   Всё это достигается путем сохранения транзакционных данных на каждом из шагов в микросервисах и их ответсвенностью за соблюдение идемпотентности.

   Такой подход отлично работает при случаях потери сообщений - сагу можно запустить с самого начала. (я на работе делал подобное, только там нужно было поднимать инфраструктуру разработки: можно было запустить с самого начала сколько угодно раз, но ресурсы создавались только 1 раз)

#### Что нужно ддля запуска:

- Minikube (также включить ingress addon)
- Helm
- Newman (тестирование запущенного приложения)

#### Начинаем:

(-1) Не забудь запустить minikube: `minikube start`

(0) работаем из директории homework-9: `cd ./homework-9` ... если вы не в ней

(1) Устанавливаем наш хелм чарт , который имеет в себе инструкции по запуску нашего приложения (неймспейс `homework-9-idempotency`):

```bash
helm upgrade homework-9-idempotency --install --create-namespace --namespace=homework-9-idempotency ./app
```

(1.1) Дамашняя работа в неймспейсе `homework-9-idempotency`, поэтому сменим неймспейс, если будете пользоваться kubectl, minikube или helm:  
`kubectl config set-context --current --namespace=homework-9-idempotency`

(2) Не забываем включить тунель в отдельном окне терминала и настроить hosts:

```bash
minikube tunnel
```

(3) Теперь Newman поможет протестировать коллекцию Postman, которая ссылается на наше локальное приложение (`--verbose` для отображения деталей):

```bash
newman run otus-homework-9-idempotency.postman_collection.json --verbose
```

Ниже вот такие логи у меня локально:

```
PS C:\code\otus-homework\homework-9> newman run otus-homework-9-idempotency.postman_collection.json --verbose
newman

otus-homework-9-idempotency

→ Get products list
  GET http://arch.homework/warehouse/products
  200 OK ★ 18ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999993},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait   dns-lookup   tcp-handshake   transfer-start   download   process   total
  20ms      5ms    808µs        383µs           4ms              5ms        1ms       38ms

  √  Successful Get get public products list

→ Register
  POST http://arch.homework/user/register
  201 Created ★ 81ms time ★ 400B↑ 361B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 108B
  │ {
  │   "username": "Cletus.Kozey66",
  │   "email": "Kadin_Langworth@yahoo.com",
  │   "password": "!k_a658CGAYVMbmt"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 143B
  │ {"username":"Cletus.Kozey66","email":"Kadin_Langworth@yahoo.com","avatarUrl":null,"id":12,"createdAt":"2024-12-04T12:31:26.803Z","role":"USER"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       500µs   (cache)      (cache)         78ms             1ms        174µs     81ms

  √  Successful POST create user

→ Login
  POST http://arch.homework/auth/login
  200 OK ★ 353ms time ★ 366B↑ 538B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 78B
  │ {
  │     "email": "Kadin_Langworth@yahoo.com",
  │   "password": "!k_a658CGAYVMbmt"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":12,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3MzMzMTU0ODcsImV4cCI6MTczMzMxNTc4N30.voei0Sz9wS_0CpWfl6JEOD4XsUUkHbaWCxJbhoIFJj4","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3MzMzMTU0ODcsImV4cCI6MTczMzQwMTg4N30.qZWiSEzptkNaTp4aHTLmWzoNOcFWOaTMAKz1IWJyFAU"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       389µs   (cache)      (cache)         350ms            1ms        80µs      353ms

  √  Successful POST login

→ Get User initital Billing data
  GET http://arch.homework/billing/user
  200 OK ★ 9ms time ★ 401B↑ 234B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 22B
  │ {"userId":12,"bill":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       193µs   (cache)      (cache)         7ms              1ms        117µs     9ms

  √  Successful Get User's initital billing data

→ Top Up User's Bill
  POST http://arch.homework/billing/user/top-up-bill
  201 Created ★ 26ms time ★ 488B↑ 242B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 22B
  │ {
  │     "bill": 2000
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":12,"bill":2000}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       207µs   (cache)      (cache)         23ms             1ms        101µs     26ms

  √  Successful top up user's bill

→ Make Common Order
  POST http://arch.homework/order/user/make-order
  201 Created ★ 24ms time ★ 559B↑ 405B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 96B
  │ {"cost":100,"data":{"products":[{"productId":1,"count":1,"cost":100}],"courierTime":1734315488}}
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 187B
  │ {"createdAtUnixTime":1733315487568,"userId":12,"cost":100,"jsonData":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}],\"courierTime\":1734315488}","id":29,"payed":0
  │ ,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  883µs     207µs   (cache)      (cache)         22ms             1ms        126µs     24ms

  √  Successful Create User's chip order

→ Get User Billing data After Chip order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 237B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":12,"bill":1900}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  885µs     182µs   (cache)      (cache)         6ms              1ms        84µs      8ms

  √  Successful Get User's billing data after chip order

→ Get user notifications
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 9ms time ★ 420B↑ 291B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 79B
  │ [{"id":25,"userId":12,"type":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       193µs   (cache)      (cache)         7ms              864µs      108µs     9ms

  √  Last User notifaction ihas success message after chip order

→ Get user payments
  GET http://arch.homework/payment/user/payments
  200 OK ★ 10ms time ★ 410B↑ 258B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 46B
  │ [{"id":25,"userId":12,"orderId":29,"payed":1}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  2ms       547µs   (cache)      (cache)         7ms              943µs      109µs     11ms

  √  Chip order has payed payment

→ Get user reserved products
  GET http://arch.homework/warehouse/user/reserved-products/29
  200 OK ★ 8ms time ★ 424B↑ 283B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 71B
  │ [{"id":25,"userId":12,"orderId":29,"productId":1,"count":1,"cost":100}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  689µs     248µs   (cache)      (cache)         6ms              950µs      73µs      8ms

  √  User has reserved products

→ Get user reserved couriers
  GET http://arch.homework/delivery/user/reserved-couriers/29
  200 OK ★ 9ms time ★ 423B↑ 280B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 68B
  │ [{"id":25,"userId":12,"orderId":29,"courierId":1,"time":1734315488}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  975µs     228µs   (cache)      (cache)         7ms              852µs      85µs      9ms

  √  User should have reserved courier

→ Get products list after normal order
  GET http://arch.homework/warehouse/products
  200 OK ★ 5ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999992},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       257µs   (cache)      (cache)         3ms              932µs      139µs     6ms

  √  Successful decrement product's count

→ Make Double of Common Order
  POST http://arch.homework/order/user/make-order
  400 Bad Request ★ 8ms time ★ 559B↑ 398B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 96B
  │ {"cost":100,"data":{"products":[{"productId":1,"count":1,"cost":100}],"courierTime":1734315488}}
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 176B
  │ {"statusCode":400,"timestamp":"2024-12-04T12:31:28.436Z","path":"/order/user/make-order","message":{"message":"Order is already exists","error":"Bad Request","statusCode":400}
  │ }
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  833µs     261µs   (cache)      (cache)         6ms              862µs      87µs      8ms

  ┌
  │ {
  │   statusCode: 400,
  │   timestamp: '2024-12-04T12:31:28.436Z',
  │   path: '/order/user/make-order',
  │   message: { message: 'Order is already exists', error: 'Bad Request', statusCode: 400 }
  │ }
  └
  √  Dohuld be error on double

→ Make Double of Common Order With Acepence
  POST http://arch.homework/order/user/make-order
  201 Created ★ 24ms time ★ 582B↑ 405B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 118B
  │ {"cost":100,"doubleAccepted":true,"data":{"products":[{"productId":1,"count":1,"cost":100}],"courierTime":1734315488}}
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 187B
  │ {"createdAtUnixTime":1733315488529,"userId":12,"cost":100,"jsonData":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}],\"courierTime\":1734315488}","id":30,"payed":0
  │ ,"closed":0}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  745µs     302µs   (cache)      (cache)         22ms             924µs      137µs     24ms

  √  Successful Create User's chip order

→ Get User Billing data After Doubled Order
  GET http://arch.homework/billing/user
  200 OK ★ 8ms time ★ 401B↑ 237B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 25B
  │ {"userId":12,"bill":1800}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  823µs     198µs   (cache)      (cache)         6ms              893µs      139µs     8ms

  √  Successful Get User's billing data after Doubled Order

→ Get user notifications after Doubled Order
  GET http://arch.homework/notification/user/notifications
  200 OK ★ 8ms time ★ 420B↑ 370B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 157B
  │ [{"id":26,"userId":12,"type":"success","text":"Successfully payid your order"},{"id":25,"userId":12,"type":"success","text":"Successfully payid your order"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  682µs     197µs   (cache)      (cache)         6ms              775µs      99µs      7ms

  √  Last User notifaction ihas success message after Doubled Order

→ Get user payments after doubleOrderId
  GET http://arch.homework/payment/user/payments
  200 OK ★ 8ms time ★ 410B↑ 303B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 91B
  │ [{"id":26,"userId":12,"orderId":30,"payed":1},{"id":25,"userId":12,"orderId":29,"payed":1}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       234µs   (cache)      (cache)         6ms              885µs      57µs      9ms

  √  Doubled Order has payed payment

→ Get user reserved products after Doubled Order
  GET http://arch.homework/warehouse/user/reserved-products/30
  200 OK ★ 8ms time ★ 424B↑ 283B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 71B
  │ [{"id":26,"userId":12,"orderId":30,"productId":1,"count":1,"cost":100}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  680µs     132µs   (cache)      (cache)         6ms              843µs      58µs      8ms

  √  User has reserved products for Doubled Order

→ Get user reserved couriers after Doubled Order
  GET http://arch.homework/delivery/user/reserved-couriers/30
  200 OK ★ 8ms time ★ 423B↑ 280B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 68B
  │ [{"id":26,"userId":12,"orderId":30,"courierId":1,"time":1734315488}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       139µs   (cache)      (cache)         6ms              723µs      56µs      8ms

  √  User should have reserved courier after Doubled Order

→ Get products list after Doubled Order
  GET http://arch.homework/warehouse/products
  200 OK ★ 4ms time ★ 243B↑ 319B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 106B
  │ [{"id":1,"name":"Product","cost":100,"count":999991},{"id":2,"name":"Zero Products","cost":100,"count":0}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  887µs     242µs   (cache)      (cache)         2ms              729µs      57µs      4ms

  √  Successful decrement product's count after Doubled Order

→ Get user Orders
  GET http://arch.homework/order/user/orders
  200 OK ★ 8ms time ★ 406B↑ 595B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 381B
  │ [{"id":29,"createdAtUnixTime":"1733315487568","userId":12,"cost":100,"payed":0,"closed":0,"jsonData":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}],\"courierTime\
  │ ":1734315488}"},{"id":30,"createdAtUnixTime":"1733315488529","userId":12,"cost":100,"payed":0,"closed":0,"jsonData":"{\"products\":[{\"productId\":1,\"count\":1,\"cost\":100}]
  │ ,\"courierTime\":1734315488}"}]
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  674µs     130µs   (cache)      (cache)         6ms              776µs      66µs      8ms

  √  List of user orders contains common and double orders

┌─────────────────────────┬─────────────────────┬────────────────────┐
│                         │            executed │             failed │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              iterations │                   1 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│                requests │                  21 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│            test-scripts │                  21 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│      prerequest-scripts │                  14 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              assertions │                  21 │                  0 │
├─────────────────────────┴─────────────────────┴────────────────────┤
│ total run duration: 2.8s                                           │
├────────────────────────────────────────────────────────────────────┤
│ total data received: 2.46kB (approx)                               │
├────────────────────────────────────────────────────────────────────┤
│ average response time: 30ms [min: 4ms, max: 353ms, s.d.: 73ms]     │
├────────────────────────────────────────────────────────────────────┤
│ average DNS lookup time: 808µs [min: 808µs, max: 808µs, s.d.: 0µs] │
├────────────────────────────────────────────────────────────────────┤
│ average first byte time: 28ms [min: 2ms, max: 350ms, s.d.: 73ms]   │
└────────────────────────────────────────────────────────────────────┘
```
