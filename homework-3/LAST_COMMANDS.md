```bash
#удалить под в неймспейсе test
kubectl delete po app-kuber --namespace=test

#удлить под примененный файлом 
kubectl delete -f ./homework-3/pod.yaml

#показать список всех подов текущего неймспейса (с доп. данными)
kubectl get po -o wide

#показать список всех подов (всех неймспейсов с их лейблами)
kubectl get po -A --show-labels

#применить конфиг для создания пода
kubectl apply -f ./homework-3/pod.yaml 

#сменить неймспейс для следующих команд
kubectl config set-context --current --namespace=default

#вывести комнфиг пода в yaml
kubectl get po app-kuber -o yaml

#порисание пода
kubectl describe pod app-kuber

#получить список неймспейсов
kubectl get ns

#создать неймспейс из yaml
kubectl apply -f ./homework-3/ns.yaml

#создать/удлаить неймспейс
kubectl create ns google
kubectl delete ns google
```