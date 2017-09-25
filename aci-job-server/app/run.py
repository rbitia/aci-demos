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
    handler = RotatingFileHandler('logs/log.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)

    app.logger.error('Getting filename from database')

    if not os.path.isfile('jobs.db'):
        setupDatabase()
    
    conn = sqlite3.connect('jobs.db')
 
    cursor = conn.execute("SELECT * FROM jobs WHERE processed = 0 ORDER BY RANDOM() LIMIT 1")

    row = cursor.fetchone()

    if(row == None):
        return json.dumps({
            'filename':"NULL",
            'processed':1,
            })

    cursor = conn.execute("SELECT * FROM time WHERE id = 1;")

    if(cursor.fetchone()[2] == 0):
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

@app.route('/getProgress')
def getProgress():
    current_time = datetime.now()

    conn = sqlite3.connect('jobs.db')
    cursor = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;")
    cursor2 = conn.execute("SELECT * FROM time WHERE id = 1;")

    start_time = datetime.strptime(cursor2.fetchone()[1],'%Y-%m-%d %H:%M:%S')
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

def setupDatabase():
    app.logger.error('The database was called')
    conn = sqlite3.connect('jobs.db')

    conn.execute('''DROP TABLE IF EXISTS jobs;''')
    conn.execute('''
        CREATE TABLE jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename NOT NULL,
            processed INTEGER DEFAULT 0 NOT NULL,
            detected INTEGER DEFAULT NULL
        );
        ''')

    conn.execute('DROP TABLE IF EXISTS time;')
    conn.execute('''
        CREATE TABLE time (
        id INTEGER PRIMARY KEY,
        start_time TEXT,
        started INTEGER
    );
    ''')

    conn.execute('INSERT INTO time values(1,"2017-09-23 18:28:24",0);')

    for root, dirs, files in os.walk('./Pics'):
        for filename in files:
            if(filename[:2] == "._"):
                filename = filename[2:]
            conn.execute("INSERT INTO jobs (filename) \
            VALUES (\"" + filename + "\");")

    conn.commit()

if __name__ == '__main__':
    #setupDatabase()
    # handler = RotatingFileHandler('logs/log.log', maxBytes=10000, backupCount=1)
    # handler.setLevel(logging.INFO)
    # app.logger.addHandler(handler)
    app.run(debug=True,host='0.0.0.0',port=80)


