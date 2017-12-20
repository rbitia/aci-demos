rm aci-webserver/app/jobs.db
docker build -t rbitia/aci-webserver:latest aci-webserver/.
docker build -t rbitia/fr-frontend:latest aci-frontend/.
docker build -t rbitia/fr-ir:latest aci-worker/.

docker push rbitia/aci-webserver:latest
docker push rbitia/fr-frontend:latest
docker push rbitia/fr-ir:latest

helm del --purge demo
helm install charts/fr-demo --name demo
kubectl get po --watch
