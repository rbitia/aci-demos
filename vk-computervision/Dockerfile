FROM python:2.7
RUN apt-get update -y
WORKDIR app
ADD . /app
RUN pip install python-twitter
CMD ["python", "textanalysis.py"]
