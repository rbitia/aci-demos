FROM ubuntu:14.04
MAINTAINER Samuel Kreter

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
    python-pip python-dev uwsgi-plugin-python \
    nginx supervisor sqlite3 libsqlite3-dev
COPY nginx/flask.conf /etc/nginx/sites-available/
COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY app /var/www/app

RUN mkdir -p /var/log/nginx/app /var/log/uwsgi/app /var/log/supervisor \
    && rm /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/flask.conf /etc/nginx/sites-enabled/flask.conf \
    && echo "daemon off;" >> /etc/nginx/nginx.conf \
    && chown -R www-data:www-data /var/www/app \
    && chown -R www-data:www-data /var/log


RUN pip install -r /var/www/app/requirements.txt

CMD ["/usr/bin/supervisord"]
