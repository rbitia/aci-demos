FROM ubuntu:14.04

MAINTAINER Alexey Kornilov <alexey.kornilov@kavolorn.ru>

COPY faceDetection.py /
COPY Pics /

RUN apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y unzip wget build-essential \
		cmake git pkg-config libswscale-dev \
		python3-dev python3-numpy \
		libtbb2 libtbb-dev libjpeg-dev \
		libpng-dev libtiff-dev libjasper-dev

RUN PYTHONPATH=/usr/lib/python3.0
RUN export $PYTHONPATH
RUN #!/bin/bash ~/.bashrc

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

CMD ["python", "./faceDetection.py"]
