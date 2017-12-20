#!flask/bin/python

#By Sam Kreter
#For use by Microsoft and other parties to demo
#Azure Container Service, Azure Container Instances
#and the experimental ACI-connector
from flask import render_template
from flask import Flask
from dbAzureBlob import DbAzureBlob
import requests
import json


import os

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getProgress')
def getProgress():

    jobserver_url = "http://" + os.getenv('IP_JOB_SERVER', "localhost")
    res = getRequest(jobserver_url + "/getProgress")

    if res == False:
        print("No Response from Jobserver")
        return json.dumps({"error":True})

    return json.dumps(res)

@app.route('/resetDb')
def resetDb():
    jobserver_url = "http://" + os.getenv('IP_JOB_SERVER', "localhost")
    res = getRequest(jobserver_url + "/resetDb")

    if res == False:
        return json.dumps({"error":True})
    
    return json.dumps(res)

@app.route('/test')
def test():
    res = getRequest("http://api.openweathermap.org/data/2.5/weather?q=London")
    if res == False:
        print("failed")

    print(res['message'])

    return json.dumps(res)

def getRequest(url):
    try:
        res = requests.get(url)
        return json.loads(res.text)
    except:
        return False



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=8080)
