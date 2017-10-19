#!flask/bin/python

#By Sam Kreter
#For use by Microsoft and other parties to demo
#Azure Container Service, Azure Container Instances
#and the experimental ACI-connector
from flask import render_template
from flask import Flask
from dbAzureBlob import DbAzureBlob


import os

app = Flask(__name__)


@app.route('/')
def index():
    jobserver_url = os.getenv('IP_JOB_SERVER', "localhost:80")
    return render_template('index.html', jobserver_url = jobserver_url)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=8080)
