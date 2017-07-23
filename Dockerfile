FROM mhart/alpine-node:8

WORKDIR /opt/shinobi

# Install package dependencies
RUN apk add --update --no-cache ffmpeg python pkgconfig cairo-dev make g++ jpeg-dev

# Install NodeJS dependencies
COPY package.json /opt/shinobi
RUN npm install && \
    npm install canvas

# Copy code
COPY . /opt/shinobi

VOLUME ["/opt/shinobi/videos"]

EXPOSE 8080
ENTRYPOINT ["/opt/shinobi/docker-entrypoint.sh" ]
