FROM ubuntu:xenial
RUN apt update \
    && apt upgrade -y \
    && apt install -y ffmpeg nodejs npm libav-tools wget --no-install-recommends
RUN apt -y install mysql-client --no-install-recommends

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
RUN cp /opt/shinobi/super.sample.json /opt/shinobi/super.json
#RUN cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
VOLUME ["/opt/shinobi/videos", "/opt/shinobi/conf"]
EXPOSE 8083
EXPOSE 3314
ENTRYPOINT ./docker-entrypoint.sh
