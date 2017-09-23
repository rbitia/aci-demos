#!flask/bin/python
from flask import render_template
from flask import Flask

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





if __name__ == '__main__':
    app.run(host='0.0.0.0',port=80)


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

