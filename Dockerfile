FROM mhart/alpine-node:8

WORKDIR /opt/shinobi
RUN apk add --update ffmpeg python pkgconfig cairo-dev make g++ jpeg-dev && \
    rm -rf /var/cache/apk/*

COPY . /opt/shinobi

RUN npm install && \
    npm install canvas

ENV MYSQL_HOST="mysql" \
    MYSQL_DATABASE="shinobi" \
    MYSQL_ROOT_USER="root" \
    MYSQL_ROOT_PASSWORD="rootpass" \
    MYSQL_USER="ccio" \
    MYSQL_PASSWORD="shinobi" \
    UTC_OFFSET="-0800"

VOLUME ["/opt/shinobi/videos"]
EXPOSE 8080
ENTRYPOINT ["/opt/shinobi/docker-entrypoint.sh" ]
