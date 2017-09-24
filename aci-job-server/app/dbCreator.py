import os
import sqlite3


conn = sqlite3.connect('jobs.db')

for root, dirs, files in os.walk('./Pics'):
    for filename in files:
        conn.execute("INSERT INTO jobs (filename) \
        VALUES (\"" + filename + "\");")

#conn.commit()

# CREATE TABLE jobs (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     filename NOT NULL,
#     processed INTEGER DEFAULT 0 NOT NULL,
#     detected INTEGER DEFAULT NULL
# );

# CREATE TABLE time (
#     id INTEGER PRIMARY KEY,
#     start_time TEXT,
#     started INTEGER
# );

# INSERT INTO time values(1,CURRENT_TIME,0);
