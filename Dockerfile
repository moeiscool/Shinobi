FROM ubuntu:xenial
MAINTAINER Moe Alam <shinobi@m03.ca>
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y ffmpeg nodejs npm libav-tools
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp conf.sample.json conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh