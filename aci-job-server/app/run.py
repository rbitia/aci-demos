#!flask/bin/python
from flask import render_template
from flask import Flask
from flask import request

import json
import sqlite3
import requests
from datetime import datetime
import os


import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)


@app.route('/')
def index():
    if not os.path.isfile('jobs.db'):
        exit("There must be a database, try running dbCreator")
    
    conn = sqlite3.connect('jobs.db')

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

    return json.dumps({'filename': filename,'processed': 0})

@app.route('/processed')
def processed():
    conn = sqlite3.connect('jobs.db')
    filename = request.args.get('filename')
    detected = request.args.get('detected')

    if(detected == "true"):
        conn.execute("UPDATE jobs set detected = 1 where filename = \"" + filename + "\";" )
    else:
        conn.execute("UPDATE jobs set detected = 0 where filename = \"" + filename + "\";" )

    conn.commit()

    conn.close()
    return "all good"

@app.route('/resetDb')
def resetDb():
    conn = sqlite3.connect('jobs.db')
    conn.execute("UPDATE jobs set detected = NULL, processed = 0;" )
    conn.execute("UPDATE time set started = 0, finished = 0;" )
    conn.commit()

    return "The database has been reset, no worries, hope you ment to do that, theres no going back man"

@app.route('/getProgress')
def getProgress():
    current_time = datetime.now()

    conn = sqlite3.connect('jobs.db')
    cursor = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;")
    time_data = conn.execute("SELECT * FROM time WHERE id = 1;").fetchone()

    start_time = datetime.strptime(time_data[1],'%Y-%m-%d %H:%M:%S')

    if(time_data[3] == 1):
        current_time = datetime.strptime(time_data[2],'%Y-%m-%d %H:%M:%S')


    total_time = (current_time - start_time).total_seconds()

    pictures = []

    for row in cursor:
        obj = {
            "filename": row[1],
            "detected": row[3]
        }
        pictures.append(obj)

    data = {
        "pictures": pictures,
        "total_time": int(total_time)
    }

    json_data = json.dumps(data)

    return  request.args.get('callback') + "(" +  json_data + ")"



if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=80)


