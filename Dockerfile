FROM ubuntu:xenial
MAINTAINER Moe Alam <shinobi@m03.ca>
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y wget curl
RUN mkdir /opt/shinobi
ADD . /opt/shinobi
WORKDIR /opt/shinobi
RUN chmod +x INSTALL/docker-xenial.sh
RUN /opt/shinobi/INSTALL/docker-xenial.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh