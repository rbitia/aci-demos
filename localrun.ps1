docker kill $(docker ps -a -q)
docker rm $(docker ps -a -q)

#docker run -p 8000:8000 -d --name webserver --env AZURE_BLOB_ACCOUNT=frdemo --net mynet chadliuxc/aci-webserver
#docker run -p 8080:8080 -d --name fr --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="webserver:8000" --net mynet chadliuxc/fr-frontend
#docker run --name ir --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="webserver:8000" --net mynet chadliuxc/fr-ir

# docker run --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="192.168.3.192:8000" --name fr-ir2 chadliuxc/fr-ir 
# docker run --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="192.168.3.192:8000" --name fr-ir3 chadliuxc/fr-ir 
# docker run --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="192.168.3.192:8000" --name fr-ir4 chadliuxc/fr-ir 
# docker run --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="192.168.3.192:8000" --name fr-ir5 chadliuxc/fr-ir 
# docker run --env AZURE_BLOB_ACCOUNT=frdemo --env IP_JOB_SERVER="192.168.3.192:8000" --name fr-ir6 chadliuxc/fr-ir 

# az contanier create -g msazure --name MyAlpine --image alpine:latest -e key1=value1 key2=value2
# az container create -g msazure-aciaks-chad -n fr-webserver --image chadliuxc/aci-webserver:latest --ip-address public --ports 8000 -e AZURE_BLOB_ACCOUNT=frdemo
# az container create -g msazure-aciaks-chad -n fr-frontend --image chadliuxc/fr-frontend:latest --ip-address public --ports 8080 -e AZURE_BLOB_ACCOUNT=frdemo IP_JOB_SERVER=52.224.15.6:8000
# az container create -g msazure-aciaks-chad -n fr-ir-1 --image chadliuxc/fr-ir:latest -e AZURE_BLOB_ACCOUNT=frdemo IP_JOB_SERVER=52.224.15.6:8000