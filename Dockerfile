FROM mhart/alpine-node:8

WORKDIR /opt/shinobi
RUN apk add --update ffmpeg python pkgconfig cairo-dev make g++ jpeg-dev && \
    rm -rf /var/cache/apk/*

COPY . /opt/shinobi

RUN npm install && \
    npm install canvas

VOLUME ["/opt/shinobi/videos"]
EXPOSE 8080
ENTRYPOINT ["/opt/shinobi/docker-entrypoint.sh" ]
