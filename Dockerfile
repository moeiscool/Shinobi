FROM ubuntu:xenial
RUN apt update \
    && apt upgrade -y \
    && apt install -y ffmpeg nodejs npm libav-tools wget mysql-client --no-install-recommends

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN mkdir /etc/shinobi \
	&& cp /opt/shinobi/conf.sample.json /etc/shinobi/conf.json \
	&& cp /opt/shinobi/super.sample.json /etc/shinobi/super.json \
	&& ln -s /etc/shinobi/conf.json /opt/shinobi/conf.json \
	&& ln -s /etc/shinobi/super.json /opt/shinobi/super.json
#RUN cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN npm install
RUN npm install pm2 -g
RUN npm install -g n && n stable
RUN chmod +x ./docker-entrypoint.sh

VOLUME ["/opt/shinobi/videos", "/etc/shinobi"]
EXPOSE 8080

CMD ./docker-entrypoint.sh