#!flask/bin/python

#By Sam Kreter
#For use by Microsoft and other parties to demo
#Azure Container Service, Azure Container Instances
#and the experimental ACI-connector
from flask import Flask, render_template, request, Response
from flask_cors import CORS
import json
import sqlite3
import requests
from datetime import datetime
import os
from dbAzureBlob import DbAzureBlob

import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

DATABASE_NAME = 'jobs.db'

@app.route('/')
def index():
    dbHelper = DbAzureBlob()

    if not os.path.isfile(DATABASE_NAME):
        print("reseting")
        dbHelper.setupDatabase()
    
    conn = sqlite3.connect(DATABASE_NAME)

    row = conn.execute("SELECT * FROM jobs WHERE processed = 0 ORDER BY RANDOM() LIMIT 1").fetchone()

    if(row == None ):
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn.execute("UPDATE time set finished = 1, finish_time = \""+ current_time +"\" where id = 1;")
        conn.commit()
    
        return json.dumps({
            'filename':"NULL",
            'processed':1,
        })

    cursor = conn.execute("SELECT * FROM time WHERE id = 1;")

    if(cursor.fetchone()[4] == 0):
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn.execute("UPDATE time set started = 1, start_time = \""+ current_time +"\" where id = 1;")
        conn.commit()

    id = row[0]
    filename = row[1]

    conn.execute("UPDATE jobs set processed = 1 where id = " + str(id) + ";" )
    conn.commit()

    conn.close()

    return Response(json.dumps({'filename': filename, 'processed': 0}), status=200, mimetype='application/json')


@app.route('/processed')
def processed():
    if not os.path.isfile(DATABASE_NAME):
        DbAzureBlob().setupDatabase()

    conn = sqlite3.connect(DATABASE_NAME)
    filename = request.args.get('filename')
    detected = request.args.get('detected')

    if(filename == None or detected == None):
        return json.dumps({"success":True,"status_code":200})

    if(detected == "true"):
        conn.execute("UPDATE jobs set detected = 1 where filename = \"" + filename + "\";" )
    else:
        conn.execute("UPDATE jobs set detected = 0 where filename = \"" + filename + "\";" )

    conn.commit()

    conn.close()
    return json.dumps({"success":True,"status_code":200})


@app.route('/resetDb')
def resetDb():
    ''' Use to delete the cache db and start the process again'''
    os.remove(DATABASE_NAME)

    return json.dumps({"success":True,"status_code":200})


@app.route('/reuseDb')
def reuseDb():
    
    if not os.path.isfile(DATABASE_NAME):
        return  request.args.get('callback') + "(" +  json.dumps({"success":False}) + ")"

    conn = sqlite3.connect(DATABASE_NAME)
    conn.execute("UPDATE jobs set detected = NULL, processed = 0;" )
    conn.execute("UPDATE time set started = 0, finished = 0;" )
    conn.commit()

    time_data = conn.execute("select * from time where id = 1;").fetchone()

    return json.dumps(time_data)
    #return  request.args.get('callback') + "(" +  json.dumps({"success":True}) + ")"

@app.route('/getProgress')
def getProgress():
    if not os.path.isfile(DATABASE_NAME):
        DbAzureBlob().setupDatabase()

    current_time = datetime.now()

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;")
    time_data = conn.execute("SELECT * FROM time WHERE id = 1;").fetchone()

    start_time = datetime.strptime(time_data[1],'%Y-%m-%d %H:%M:%S')

    if(time_data[3] == 1):
        current_time = datetime.strptime(time_data[2],'%Y-%m-%d %H:%M:%S')

    total_time = (current_time - start_time).total_seconds()

    if time_data[4] == 0:
        total_time = 0

    pictures = []

    for row in cursor:
        obj = {
            "filename": row[1],
            "detected": row[3]
        }
        pictures.append(obj)

    data = {
        "success": True,
        "pictures": pictures,
        "total_time": int(total_time)
    }

    json_data = json.dumps(data)

    return json_data 


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=8000)


