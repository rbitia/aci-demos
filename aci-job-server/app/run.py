#!flask/bin/python
from flask import render_template
from flask import Flask
from flask import request

import json
import sqlite3
import requests

app = Flask(__name__)


@app.route('/')
def index():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.execute("SELECT * FROM jobs WHERE processed = 0 ORDER BY RANDOM() LIMIT 1")

    row = cursor.fetchone()

    id = row[0]
    filename = row[1]

    conn.execute("UPDATE jobs set processed = 1 where id = " + str(id) + ";" )
    conn.commit()

    test = {'filename': filename}

    conn.close()

    return json.dumps(test)

@app.route('/processed')
def processed():
    conn = sqlite3.connect('jobs.db')
    filename = request.args.get('filename')
    detected = request.args.get('detected')


    if(detected == "true"):
        det = 1
    else:
        det = 0

    conn.execute("UPDATE jobs set detected = " + str(det) + " where filename = \"" + filename + "\";" )
    conn.commit()

    conn.close()
    return "all good"

@app.route('/getProgress')
def getProgress():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;")

    info = []

    for row in cursor:
        obj = {
            "filename": row[1],
            "detected": row[3]
        }
        info.append(obj)

    data = json.dumps(info)

    return  request.args.get('callback') + "(" +  data + ")"







if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8000)


#Going fast so just thowing this here for now
# '''
# CREATE TABLE jobs (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     filename NOT NULL,
#     processed INTEGER DEFAULT 0 NOT NULL,
#     detected INTEGER DEFAULT NULL
# );

# insert into jobs(filename) values("hello");
# '''

