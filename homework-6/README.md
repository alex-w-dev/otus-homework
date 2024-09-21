### Архитектура:

К сожалению не осталось времени, чтобы c4 красиво нарисовать, поэтому нашел подходящую картинку<a name="my-scrinshot">🔗</a> (всё так и есть, только микросервисы 1, 2 и 3 еще не подключены, апи гетвей у меня ingress nginx):
![Моя база ](https://miro.medium.com/v2/resize:fit:720/format:webp/1*qz0_BzIJVtYVBYAb3NZFdg.png)

#### Что нужно ддля запуска:

- Minikube (также включить ingress addon)
- Helm
- Newman (тестирование запущенного приложения)

#### Начинаем:

(0) Не забудь запустить minikube: `minikube start`

(1) Устанавливаем наш хелм чарт , который имеет в себе инструкции по запуску нашего приложения (неймспейс `homework-6`):

```bash
helm upgrade alex-homework-6 --install --create-namespace --namespace=homework-6 ./app
```

(1.0) Убедиться, что все стартануло, можно командой `kubectl get po -n homework-6` - 2 пода должны быть READY (напоминаю что другие сервисы подключу позднее, когда нужно будет расширять приложение)

(1.1) Дамашняя работа в неймспейсе `homework-6`, поэтому сменим неймспейс, если будете пользоваться kubectl: `kubectl config set-context --current --namespace=homework-6`

(2) Не забываем включить тунель в отдельном окне терминала и настроить hosts:

```bash
minikube tunnel
```

(3) Теперь Newman поможет протестировать коллекцию Postman, которая ссылается на наше локальное приложение (`--verbose` для отображения деталей):

```bash
newman run otus-homework-6.postman_collection.json --verbose
```

Ниже вот такие логи у меня локально:

```
PS C:\code\otus-homework\homework-6> newman run otus-homework-6.postman_collection.json --verbose -r cli --reporter-json-export verbose-report.json
newman

otus-homework-6

→ Register
  POST http://arch.homework/user/register
  201 Created ★ 83ms time ★ 401B↑ 362B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 109B
  │ {
  │   "username": "Pamela.Dibbert",
  │   "email": "Stevie_Streich@hotmail.com",
  │   "password": "!wxEVvpgwtqNIfIi"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 144B
  │ {"username":"Pamela.Dibbert","email":"Stevie_Streich@hotmail.com","avatarUrl":null,"id":15,"createdAt":"2024-09-20T16:23:55.647Z","role":"USER"}
  └
  prepare   wait   dns-lookup   tcp-handshake   transfer-start   download   process   total
  20ms      6ms    718µs        386µs           69ms             5ms        1ms       104ms

  √  Successful POST create user

→ Unauthorized Update User
  PATCH http://arch.homework/user/15
  401 Unauthorized ★ 5ms time ★ 392B↑ 308B↓ size ★ 9↑ 4↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 105B
  │ {
  │   "username": "",
  │   "email": "Anissa.Dickinson22@gmail.com",
  │   "password": "Emma_Kuhlman80@gmail.com"
  │ }
  └
  ┌ ↓ text/html ★ text ★ html ★ utf8 ★ 172B
  │ <html>
  │ <head><title>401 Authorization Required</title></head>
  │ <body>
  │ <center><h1>401 Authorization Required</h1></center>
  │ <hr><center>nginx</center>
  │ </body>
  │ </html>
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  926µs     399µs   (cache)      (cache)         2ms              1ms        139µs     5ms

  √  Fail Unauthorized Update User

→ Unauthorized Read Profile
  GET http://arch.homework/user/profile
  401 Unauthorized ★ 4ms time ★ 237B↑ 308B↓ size ★ 7↑ 4↓ headers ★ 0 cookies
  ┌ ↓ text/html ★ text ★ html ★ utf8 ★ 172B
  │ <html>
  │ <head><title>401 Authorization Required</title></head>
  │ <body>
  │ <center><h1>401 Authorization Required</h1></center>
  │ <hr><center>nginx</center>
  │ </body>
  │ </html>
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       248µs   (cache)      (cache)         2ms              1ms        115µs     5ms

  √  Fail Unauthorized Read Profile

→ Login
  POST http://arch.homework/auth/login
  200 OK ★ 120ms time ★ 367B↑ 538B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 79B
  │ {
  │     "email": "Stevie_Streich@hotmail.com",
  │   "password": "!wxEVvpgwtqNIfIi"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":15,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3MjY4NDk0MzUsImV4cCI6MTcyNjg0OTczNX0.yYYfy_1vgJN-G_FFdWbl3KhEwovRLEk1lfW7xbUJ65Q","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3MjY4NDk0MzUsImV4cCI6MTcyNjkzNTgzNX0.X31f9QgJJucP82kNRl2dSt-83U-_bIjoqBkjNDZR83Q"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       229µs   (cache)      (cache)         117ms            1ms        147µs     120ms

  √  Successful POST login

→ Successful refresh token
  POST http://arch.homework/auth/refresh
  201 Created ★ 90ms time ★ 421B↑ 543B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":15,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3MjY4NDk0MzYsImV4cCI6MTcyNjg0OTczNn0.Zqe0LgHJH1G4sKBsnataxFSAV-HMBrcnpeGmjTtDIDc","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3MjY4NDk0MzYsImV4cCI6MTcyNjkzNTgzNn0.f6aIVQEsxoBtHy0NhKVckttukFNMTx5JG07qFPtU0k4"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       245µs   (cache)      (cache)         88ms             1ms        108µs     91ms

  √  Successful refresh token

→ Authorized Read Profile
  GET http://arch.homework/user/profile
  200 OK ★ 8ms time ★ 401B↑ 439B↓ size ★ 8↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 226B
  │ {"id":15,"username":"Pamela.Dibbert","email":"Stevie_Streich@hotmail.com","avatarUrl":null,"role":"USER","hashedRefreshToken":"$argon2id$v=19$m=65536,t=3,p=4$64wbNJTqGgdev1lum
  │ qoMNQ$lQStwiwK+1g0G4Ieu145C5C85O4nLuptVWeKtY3w3dw"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       536µs   (cache)      (cache)         6ms              1ms        73µs      9ms

  √  Authorized Read Profile

→ Authorized Update User
  PATCH http://arch.homework/user/15
  200 OK ★ 31ms time ★ 486B↑ 441B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 36B
  │ {
  │   "username": "Johnathon.Jast30"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 228B
  │ {"id":15,"username":"Johnathon.Jast30","email":"Stevie_Streich@hotmail.com","avatarUrl":null,"role":"USER","hashedRefreshToken":"$argon2id$v=19$m=65536,t=3,p=4$64wbNJTqGgdev1l
  │ umqoMNQ$lQStwiwK+1g0G4Ieu145C5C85O4nLuptVWeKtY3w3dw"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  910µs     264µs   (cache)      (cache)         28ms             1ms        74µs      31ms

  √  Authorized Update User Success

→ Signout
  POST http://arch.homework/auth/signout
  201 Created ★ 9ms time ★ 421B↑ 127B↓ size ★ 9↑ 4↓ headers ★ 0 cookies
  ↓ text/plain ★ text ★ plain ★ utf8

  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  860µs     176µs   (cache)      (cache)         7ms              1ms        156µs     9ms

  √  Successful POST Signout

→ Unsuccessful try to refresh token Copy
  POST http://arch.homework/auth/refresh
  401 Unauthorized ★ 6ms time ★ 421B↑ 337B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 114B
  │ {"statusCode":401,"timestamp":"2024-09-20T16:23:56.623Z","path":"/auth/refresh","message":"Invalid Refresh Token"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       403µs   (cache)      (cache)         4ms              914µs      69µs      6ms

  √  Unsuccessful try to refresh token

→ Register Hacker
  POST http://arch.homework/user/register
  201 Created ★ 68ms time ★ 400B↑ 361B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 108B
  │ {
  │   "username": "Mervin_Reynolds",
  │   "email": "Stephany.Hilll@yahoo.com",
  │   "password": "!2YLkf0xtDrWKmOq"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 143B
  │ {"username":"Mervin_Reynolds","email":"Stephany.Hilll@yahoo.com","avatarUrl":null,"id":16,"createdAt":"2024-09-20T16:23:56.761Z","role":"USER"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       297µs   (cache)      (cache)         66ms             1ms        89µs      69ms

  √  Successful hacker register

→ Login Hacker
  POST http://arch.homework/auth/login
  200 OK ★ 105ms time ★ 365B↑ 538B↓ size ★ 9↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 77B
  │ {
  │     "email": "Stephany.Hilll@yahoo.com",
  │   "password": "!2YLkf0xtDrWKmOq"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 324B
  │ {"id":16,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJpYXQiOjE3MjY4NDk0MzYsImV4cCI6MTcyNjg0OTczNn0.nCWiR67v12kBJl8HkMfSzkmLXRrvhHoUg_RpL7l7PhI","refreshT
  │ oken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJpYXQiOjE3MjY4NDk0MzYsImV4cCI6MTcyNjkzNTgzNn0.GoBURn8F3hKKb2tgnoM-UITv3Mn9OrqNMBqiXHQ9Zco"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       347µs   (cache)      (cache)         102ms            951µs      134µs     105ms

  √  Successful hacker login

→ Authorized Hacker Update User
  PATCH http://arch.homework/user/15
  403 Forbidden ★ 7ms time ★ 479B↑ 340B↓ size ★ 10↑ 6↓ headers ★ 0 cookies
  ┌ ↑ raw ★ 29B
  │ {
  │   "username": "Aurelio83"
  │ }
  └
  ┌ ↓ application/json ★ text ★ json ★ utf8 ★ 120B
  │ {"statusCode":403,"timestamp":"2024-09-20T16:23:57.042Z","path":"/user/15","message":"You can update only your profile"}
  └
  prepare   wait    dns-lookup   tcp-handshake   transfer-start   download   process   total
  1ms       198µs   (cache)      (cache)         5ms              901µs      128µs     7ms

  √  Fail Authorized hacker Update User

┌─────────────────────────┬─────────────────────┬────────────────────┐
│                         │            executed │             failed │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              iterations │                   1 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│                requests │                  12 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│            test-scripts │                  12 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│      prerequest-scripts │                   3 │                  0 │
├─────────────────────────┼─────────────────────┼────────────────────┤
│              assertions │                  12 │                  0 │
├─────────────────────────┴─────────────────────┴────────────────────┤
│ total run duration: 1549ms                                         │
├────────────────────────────────────────────────────────────────────┤
│ total data received: 2.29kB (approx)                               │
├────────────────────────────────────────────────────────────────────┤
│ average response time: 44ms [min: 4ms, max: 120ms, s.d.: 43ms]     │
├────────────────────────────────────────────────────────────────────┤
│ average DNS lookup time: 718µs [min: 718µs, max: 718µs, s.d.: 0µs] │
├────────────────────────────────────────────────────────────────────┤
│ average first byte time: 41ms [min: 2ms, max: 117ms, s.d.: 42ms]   │
└────────────────────────────────────────────────────────────────────┘
```
