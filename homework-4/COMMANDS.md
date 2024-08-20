```bash
#подсказки по версиям АПИ для объектов k8s
kubectl api-resources

#логи пода
kubectl logs  kuber-job-q5zx2



openssl rand -base64 756 > key.txt # https://www.cryptool.org/en/cto/openssl/

kubectl create secret generic keyfilesecret --from-file=key.txt

echo -n 'admin' | base64
echo -n 'password' | base64

kubectl create -f secret.yaml

#запуск монго на нашем кубере
helm upgrade mongo -f mongodb-values.yaml --install oci://registry-1.docker.io/bitnamicharts/mongodb
```
