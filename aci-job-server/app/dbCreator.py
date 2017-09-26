import os
import sqlite3


def setupDatabase():
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
        finish_time TEXT,
        finished INTEGER,
        started INTEGER
    );
    ''')

    conn.execute('INSERT INTO time values(1,"2017-09-23 18:28:24","2017-09-23 18:28:24",0,0);')

    for root, dirs, files in os.walk('./Pics'):
        for filename in files:
            if(filename[:2] == "._"):
                filename = filename[2:]
            conn.execute("INSERT INTO jobs (filename) \
            VALUES (\"" + filename + "\");")

    conn.commit()

    
if __name__ == '__main__':
  setupDatabase()