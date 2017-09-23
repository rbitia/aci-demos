## Creating the docker image
1. Inside the directory run docker build 

    `docker build -t <image-name> .`
    
2. You should now be able to see the docker images using: `docker images`

## Running the image

On Docker host run: `docker run -d -p 80:80 <image-name>`

On Docker machine run: `docker run -d -p 80:80 <image-name>`

Docker compose: `docker-compose up -d`


### Credits
Base image 
Source code: https://github.com/p0bailey/docker-flask
DockerHub: https://hub.docker.com/r/p0bailey/docker-flask/


