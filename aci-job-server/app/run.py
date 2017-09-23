#!flask/bin/python
from flask import render_template
from flask import Flask
from flask import request

import json
import sqlite3
import requests
from datetime import datetime

app = Flask(__name__)


@app.route('/')
def index():
    print("yo")
    conn = sqlite3.connect('jobs.db')

    cursor = conn.execute("SELECT * FROM jobs WHERE processed = 0 ORDER BY RANDOM() LIMIT 1")

    print("hello1")
    row = cursor.fetchone()

    cursor = conn.execute("SELECT * FROM time WHERE id = 1;")
    print("hello")

    if(cursor.fetchone()[2] == 0):
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn.execute("UPDATE time set started = 1, start_time = \""+ current_time +"\" where id = 1;")
        conn.commit()

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
    current_time = datetime.now()

    conn = sqlite3.connect('jobs.db')
    cursor = conn.execute("SELECT * FROM jobs WHERE detected IS NOT NULL;")
    cursor2 = conn.execute("SELECT * FROM time WHERE id = 1;")


    start_time = datetime.strptime(cursor2.fetchone()[1],'%Y-%m-%d %H:%M:%S')
    total_time = (current_time - start_time).total_seconds()

    print(total_time)

    pictures = []

    for row in cursor:
        obj = {
            "filename": row[1],
            "detected": row[3]
        }
        pictures.append(obj)

    data = {
        "pictures": pictures,
        "total_time": total_time
    }

    json_data = json.dumps(data)

    return  request.args.get('callback') + "(" +  json_data + ")"



if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=8000)


