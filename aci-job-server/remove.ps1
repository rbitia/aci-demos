docker stop $(docker ps -a -q) 
docker rm $(docker ps -a -q) 
docker build -t jobserver . 
#docker run -p 80:80 -v C:\Users\sakreter\test\aci-demos\aci-job-server\logs\nginx:/var/log/nginx/ jobserver
docker run -p 80:80 -v C:\Users\sakreter\test\aci-demos\aci-job-server\logs:/var/www/app/logs jobserver

