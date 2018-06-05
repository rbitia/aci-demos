FROM ubuntu:14.04
MAINTAINER Samuel Kreter

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
    python3-pip python3-dev \
    sqlite3 libsqlite3-dev \
    build-essential libssl-dev libffi-dev


COPY ./app/requirements.txt .
RUN pip3 install -r ./requirements.txt

COPY app/ /app
WORKDIR /app

CMD ["python3", "run.py"]
