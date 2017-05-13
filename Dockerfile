FROM ubuntu:xenial
RUN apt update && apt install -y \
    ffmpeg nodejs npm libav-tools wget \
    mysql-client --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/nodejs /usr/bin/node

COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json && cp /opt/shinobi/super.sample.json /opt/shinobi/super.json
#RUN cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json
WORKDIR /opt/shinobi
RUN npm install && npm install pm2 -g && chmod +x ./docker-entrypoint.sh
VOLUME ["/opt/shinobi/videos"]
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh
