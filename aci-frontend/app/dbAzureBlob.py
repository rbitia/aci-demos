#By Sam Kreter
#For use by Microsoft and other parties to demo
#Azure Container Service, Azure Container Instances
#and the experimental ACI-connector
import os
from azure.storage.blob import BlockBlobService
import sqlite3

COPY_PICS_NUM = 10

class DbAzureBlob:
    
    def __init__(self):
        AZURE_BLOB_ACCOUNT = os.environ.get('AZURE_BLOB_ACCOUNT')

        if not AZURE_BLOB_ACCOUNT:
            raise EnvironmentError("Must have env variables AZURE_BLOB_ACCOUNT set for this to work.")

        self.block_blob_service = BlockBlobService(account_name= AZURE_BLOB_ACCOUNT)


    def getImageFromAzureBlob(self,filename_src, filename_dest):
        try:
            self.block_blob_service.get_blob_to_path('pictures', filename_src, filename_dest)
            return True
        except Exception as ex:
            print("getImageFromAzureBlob: ")
            return False


    def getAllImagesFromAzureBlob(self,container,dest_folder):
        generator = self.block_blob_service.list_blobs('pictures')

        success = []

        for blob in generator:
            try:
                self.block_blob_service.get_blob_to_path(container, blob.name, dest_folder + blob.name)
                success.append(True)
            except Exception as ex:
                print("getAllImagesFromAzureBlob: ", ex)
                success.append(False)
            
        return all(success)

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
