
#By Ria Bhatia
#Helpful sources: OpenCV tutorials
#For use by Microsoft and other parties to demo
#Azure Container Service, Azure Container Instances
#and the experimental ACI-connector

import sys
import numpy as np
import cv2
from PIL import Image
import glob
import os
import time
from paramiko import SSHClient

start_time = time.time()                        # Start the timer

def detect(img, cascade):                       # Figure out if the image has a face
    rects = cascade.detectMultiScale(img, scaleFactor=1.3,
    minNeighbors=4, minSize=(30, 30),flags=cv2.CASCADE_SCALE_IMAGE)
    if len(rects) == 0:                         # No face found
        return []
    rects[:,2:] += rects[:,:2]                  # Face found
    return rects

image_list=[]

def draw_rects(img, rects, color):              # Draw a rectangle around the face (Not being used)
    for x1, y1, x2, y2 in rects:
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

count = 0
#make a request
# 
for filename in glob.glob('app/Pics/*.jpg'):    # Go through the folder with pictures
    print(filename)
    entirePath= filename
    countstr= str(count)
    detectedPath = "app/detectedFaces/face" + countstr + ".jpg"
    img = cv2.imread(filename)
    image_list.append(img)
    cascade = cv2.CascadeClassifier('app/haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    rects = detect(gray, cascade)

    if rects != []:
        count= count+1                          # Count the number of images with faces
        os.rename(entirePath, detectedPath)
        print("Detected faces:")
        print(detectedPath)

for img in image_list:
    vis = img.copy()
    draw_rects(vis, rects, (0, 255, 0))

#    cv2.imshow('faceDetection', vis)
#    if cv2.waitKey(5) == 27:
#            break
#cv2.destroyAllWindows()

print("Number of pictures with faces:")
print(count)
totalTime = str((time.time() - start_time))
print("--- %s seconds ---" % totalTime)
fileTime= open("time.txt","w")
#fileTime.write('I like pie' + totalTime)
fileTime.close()
