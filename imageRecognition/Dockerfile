FROM rbitia/aci-imagedemo
MAINTAINER Ria Bhatia


RUN sudo apt-get update \
	&& sudo apt-get install build-essential \
     cmake git libgtk2.0-dev pkg-config \
     libavcodec-dev libavformat-dev libswscale-dev

RUN cd \
  && wget https://github.com/opencv/opencv/archive/3.1.0.zip \
  && unzip 3.1.0.zip \
  && cd opencv-3.1.0 \
  && mkdir build \
  && cd build \
  && cmake .. \
  && make -j3 \
  && make install \
  && cd \
  && rm 3.1.0.zip

RUN cd imageRecognition \
  && chmod +x faceDetection.py
  && python faceDetection.py
  
