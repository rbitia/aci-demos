#by ria bhatia with help from OpenCV tutorials 
#this code is to be used for demo purposes only
import sys
import numpy as np
import cv2
from PIL import Image
import glob


def detect(img, cascade):
    rects = cascade.detectMultiScale(img, scaleFactor=1.3, minNeighbors=4, minSize=(30, 30),
                                     flags=cv2.CASCADE_SCALE_IMAGE)
    if len(rects) == 0:
        return []
    rects[:,2:] += rects[:,:2]
    return rects

image_list=[]

def draw_rects(img, rects, color):
    for x1, y1, x2, y2 in rects:
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

count = 0
print("am i here4")
for filename in glob.glob('app/Pics/*.jpg'):
    print(filename)
    img = cv2.imread(filename)
    image_list.append(img)
    cascade = cv2.CascadeClassifier('app/haarcascade_frontalface_default.xml')
    #eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')
    #gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    #faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    rects = detect(gray, cascade)
    if rects != []:
        count= count+1
for img in image_list:
    vis = img.copy()
    draw_rects(vis, rects, (0, 255, 0))
#    cv2.imshow('faceDetection', vis)
#    if cv2.waitKey(5) == 27:
#            break
#cv2.destroyAllWindows()
print("Number of pictures with faces:")
print(count)
