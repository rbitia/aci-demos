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
from datetime import timedelta
import os
from dbAzureBlob import DbAzureBlob

import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

DATABASE_NAME = 'jobs.db'

@app.route('/api')
def index():
    dbHelper = DbAzureBlob()

    if not os.path.isfile(DATABASE_NAME):
        print("reseting")
        dbHelper.setupDatabase()
    
    conn = sqlite3.connect(DATABASE_NAME)

    row = conn.execute("SELECT * FROM jobs WHERE processed = 0 ORDER BY RANDOM() LIMIT 1").fetchone()

    if(row == None ):
        return json.dumps({
            'filename':"NULL",
            'processed':1,
        })

    id = row[0]
    filename = row[1]
    conn.close()

    return Response(json.dumps({'id': id, 'filename': filename, 'processed': 0 }), status=200, mimetype='application/json')


@app.route('/api/processed')
def processed():
    if not os.path.isfile(DATABASE_NAME):
        DbAzureBlob().setupDatabase()

    conn = sqlite3.connect(DATABASE_NAME)
    id = request.args.get('id')
    filename = request.args.get('filename')
    detected = request.args.get('detected')
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    worker_id = request.args.get('worker_id')
    if(filename == None or detected == None):
        return json.dumps({"success":True,"status_code":200})

    conn.execute("UPDATE jobs set detected = ? , start_time = ? , end_time = ? , worker_id = ? where filename = ?", (bool(detected), start_time, end_time, worker_id, filename ) )

    conn.commit()

    conn.close()
    return json.dumps({"success":True,"status_code":200})


@app.route('/api/resetDb')
def resetDb():
    ''' Use to delete the cache db and start the process again'''
    os.remove(DATABASE_NAME)

    return json.dumps({"success":True,"status_code":200})


@app.route('/api/reuseDb')
def reuseDb():
    
    if not os.path.isfile(DATABASE_NAME):
        return  request.args.get('callback') + "(" +  json.dumps({"success":False}) + ")"

    conn = sqlite3.connect(DATABASE_NAME)
    conn.execute("UPDATE jobs set detected = NULL, start_time = NULL, end_time = NULL, processed = 0, worker_id = NULL, processed_time = NULL;" )
    conn.commit()

    return json.dumps({"success": True})
    #return  request.args.get('callback') + "(" +  json.dumps({"success":True}) + ")"

@app.route('/api/getFile')
def getFile():
    if not os.path.isfile(DATABASE_NAME):
        DbAzureBlob().setupDatabase()

    conn = sqlite3.connect(DATABASE_NAME)
    
    timeout_time = datetime.utcnow() - timedelta(seconds=45)
    row = conn.execute("SELECT * FROM jobs WHERE processed = 0 or (processed = 1 and detected is NULL and processed_time < ?) ORDER BY RANDOM() LIMIT 1 ;", (timeout_time,)).fetchone()

    if(row == None ):
        return json.dumps({
            'filename':"NULL",
            'processed':1,
        })

    id = row[0]
    filename = row[1]

    conn.execute("UPDATE jobs set processed = 1, processed_time = ? where id = ? ;", (datetime.utcnow(), id))
    conn.commit()

    conn.close()

    return Response(json.dumps({'id': id, 'filename': filename, 'processed': 0}), status=200, mimetype='application/json')
    

@app.route('/api/getProgress')
def getProgress():
    if not os.path.isfile(DATABASE_NAME):
        DbAzureBlob().setupDatabase()
    req_start_time = datetime.utcnow()

    TIME_SPAN = 30
    processed_count = 0
    total_time = 0
    current_time = datetime.utcnow()

    conn = sqlite3.connect(DATABASE_NAME)
    total_rows = conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0]
    rows = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;").fetchall()
    if len(rows) > 0 :
        time_range = conn.execute("SELECT MIN(start_time), MAX(end_time) from jobs WHERE detected IS NOT NULL;").fetchone()
        start_time = datetime.strptime(time_range[0], '%Y-%m-%d %H:%M:%S.%f')
        interval_start_time = current_time - timedelta(seconds=TIME_SPAN) 
        processed_count = conn.execute("SELECT COUNT(*) FROM jobs WHERE detected IS NOT NULL AND end_time > ? ;", (str(interval_start_time),)).fetchone()[0]
    conn.close()

    speed = processed_count / TIME_SPAN

    if (len(rows) == 0):
        total_time = 0
    elif (len(rows) != total_rows):
        total_time = (current_time - start_time).total_seconds()
    else:
        total_time = (datetime.strptime(time_range[1], '%Y-%m-%d %H:%M:%S.%f') - start_time).total_seconds()

    pictures = []

    for row in rows:
        obj = {
            "filename": row[1],
            "detected": row[3]
        }
        pictures.append(obj)

    data = {
        "success": True,
        "pictures": pictures,
        "speed": speed,
        "speed_time": str(current_time),
        "total_period": int(total_time)
    }

    json_data = json.dumps(data)

    req_end_time = datetime.utcnow()
    print("request spend: " + str((req_start_time - req_end_time).total_seconds()))
    return json_data 


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=8000)


