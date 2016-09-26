FROM node:6.4

MAINTAINER Yusaku Kido

LABEL "version"="1.0.0"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN git clone https://github.com/NeoBoris/locationViewer.git

WORKDIR /usr/src/app/locationViewer

RUN npm install

RUN npm install -g bower

RUN bower --allow-root install

CMD ["gulp", "watch"]