import os
import sqlite3


conn = sqlite3.connect('jobs.db')
cursor = conn.execute("SELECT start_time FROM time WHERE id = 1;")
cursor.fetchone()
