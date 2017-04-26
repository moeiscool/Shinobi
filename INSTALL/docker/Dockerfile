FROM ubuntu:xenial
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y ffmpeg nodejs npm libav-tools
RUN ln -s /usr/bin/nodejs /usr/bin/node && mkdir /opt/shinobi
WORKDIR /opt/shinobi
ADD . .
RUN npm install \
    && chmod +x ./docker-entrypoint.sh
ENTRYPOINT ./docker-entrypoint.sh