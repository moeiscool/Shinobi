FROM ubuntu:xenial
COPY . /opt/shinobi
WORKDIR /opt/shinobi

ENV MYSQL_HOST="shinobi-db" \
    MYSQL_DATABASE="shinobi" \
    MYSQL_ROOT_USER="root" \
    MYSQL_ROOT_PASSWORD="rootpass" \
    MYSQL_USER="ccio" \
    MYSQL_PASSWORD="shinobi"

RUN apt update \
    && apt install -y curl \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash \
    && apt install --no-install-recommends -y ffmpeg nodejs libav-tools \
    wget mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json \
    && cp /opt/shinobi/super.sample.json /opt/shinobi/super.json \
    && npm install \
    && npm install pm2 -g \
    && chmod +x ./docker-entrypoint.sh
    # && cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json

VOLUME ["/opt/shinobi/videos"]
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh
