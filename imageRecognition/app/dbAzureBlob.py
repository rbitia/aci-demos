import os
from azure.storage.blob import BlockBlobService
import sqlite3


COPY_PICS_NUM = 10

class DbAzureBlob:
    
    def __init__(self):
        AZURE_BLOB_ACCOUNT = os.environ.get('AZURE_BLOB_ACCOUNT')
        AZURE_BLOB_KEY = os.environ.get('AZURE_BLOB_KEY')

        if not AZURE_BLOB_ACCOUNT or not AZURE_BLOB_KEY:
            raise EnvironmentError("Must have env variables AZURE_BLOB_ACCOUNT and AZURE_BLOB_KEY set for this to work.")

        self.block_blob_service = BlockBlobService(account_name= AZURE_BLOB_ACCOUNT, account_key=AZURE_BLOB_KEY)


    def getImageFromAzureBlob(self,filename_src, filename_dest):
        self.block_blob_service.get_blob_to_path('pictures', filename_src, filename_dest)

    def doubleDatabase(self):
        conn = sqlite3.connect('jobs.db')
        cursor = conn.execute("SELECT * FROM jobs;")
        for row in cursor:
            conn.execute("INSERT INTO jobs (filename) \
                VALUES (\"" + row[1] + "\");")
        conn.commit()

    def setupDatabase(self):
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

        generator = self.block_blob_service.list_blobs('pictures')
        for blob in generator:
            if(blob.name[:2] == "._"):
                blob.name = blob.name[2:]
            for i in range(COPY_PICS_NUM):
                conn.execute("INSERT INTO jobs (filename) \
                    VALUES (\"" + blob.name + "\");")

        conn.commit()
