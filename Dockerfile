FROM mhart/alpine-node:8

WORKDIR /opt/shinobi
RUN apk add --update --no-cache ffmpeg python pkgconfig cairo-dev make g++ jpeg-dev

COPY . /opt/shinobi

RUN npm install && \
    npm install canvas

VOLUME ["/opt/shinobi/videos"]
EXPOSE 8080
ENTRYPOINT ["/opt/shinobi/docker-entrypoint.sh" ]
