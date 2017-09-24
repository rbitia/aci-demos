#!flask/bin/python
from flask import render_template
from flask import Flask

import os

app = Flask(__name__)


@app.route('/')
def index():

    jobserver_url = os.getenv('IP_JOB_SERVER', "localhost")
    return render_template('index.html', jobserver_url = jobserver_url)

@app.route('/charts3d')
def chart3d():
    return render_template('charts.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=80)
