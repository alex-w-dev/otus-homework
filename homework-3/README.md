#### Установка

(ОПЦИОНАЛЬНО) Если хотете, то можно создать неймспейс и переключиться на него (`test`):

```bash
kubectl create ns test
kubectl config set-context --current --namespace=test
```

(1) Создадим деплой:

```bash
kubectl apply -f deploy.yaml
```

(2) Создадим service:

```bash
kubectl apply -f service.yaml
```

(3) Создадим ingress:

```bash
kubectl apply -f ingress.yaml
```

(4) Если у вас включен тунель (`minikube tunnel` в другом окне терминала) и настроен файл `hosts`, то будут доступны следующие url (простите, что без постмана):

- [http://arch.homework/health](http://arch.homework/health) - health

(4.beta) До звездочки сыровато, но у меня ОКАЗЫВАЕТСЯ время поджимает и поэтому, если применить еще 1 ингресс конфиг:

```bash
kubectl apply -f ingress-rewrite.yaml
```

- [http://arch.homework/otusapp/MyAccont/health](http://arch.homework/otusapp/MyAccont/health) - то будет перенаправление как в задании...
- но в целом тюнить надо, потому что каким-то образом этот ингрес забирает на себя этот урл [http://arch.homework/health/gggew](http://arch.homework/health/gggew) , хотя в описании нет правил, видимо какие-то флаги надо раскопать ... Кстати `nginx.ingress.kubernetes.io/rewrite-target: /health`, потому что в задании так: все запросы на /health , так-то я бы `$2` поставил, чтобы всё, что после `otusapp/MyAccont/*` забиралось как есть
