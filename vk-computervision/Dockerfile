FROM python:2.7-alpine3.8
WORKDIR app
ADD . /app
RUN pip install python-twitter
CMD ["python", "textanalysis.py"]
