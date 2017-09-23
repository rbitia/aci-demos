import os
import sqlite3


conn = sqlite3.connect('jobs.db')

for root, dirs, files in os.walk('./Pics'):
    for filename in files:
        conn.execute("INSERT INTO jobs (filename) \
        VALUES (\"" + filename + "\");")

conn.commit()
