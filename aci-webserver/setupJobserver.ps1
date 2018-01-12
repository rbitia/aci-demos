docker stop $(docker ps -a -q) 
docker rm $(docker ps -a -q) 
docker build -t jobserver . 
docker run -p 80:80 --env-file ../.env -v ./logs/:/var/log/uwsgi/app/ jobserver

