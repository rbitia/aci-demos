docker build -t rbitia/aci-webserver:latest aci-job-server/.
docker build -t rbitia/fr-frontend:latest demo-aci-image/.

docker push rbitia/aci-webserver:latest
docker push rbitia/fr-frontend:latest
