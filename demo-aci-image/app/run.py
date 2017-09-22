#!flask/bin/python
from flask import render_template
from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/charts3d')
def chart3d():
    return render_template('charts.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=80)
