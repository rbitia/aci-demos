FROM ubuntu:14.04
MAINTAINER Samuel Kreter

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
    python3-pip python3-dev \
    sqlite3 libsqlite3-dev \
    build-essential libssl-dev libffi-dev

COPY app /var/www/app

RUN pip3 install -r /var/www/app/requirements.txt

CMD ["python3", "/var/www/app/run.py"]
