FROM ubuntu:xenial
RUN apt update \
    && apt upgrade -y \
    && apt install -y ffmpeg nodejs npm libav-tools wget --no-install-recommends
RUN echo 'mysql-server mysql-server/root_password password night' | debconf-set-selections
RUN echo 'mysql-server mysql-server/root_password_again password night' | debconf-set-selections
RUN apt -y install mysql-server --no-install-recommends
RUN sed -ie "s/^bind-address\s*=\s*127\.0\.0\.1$/#bind-address = 127.0.0.1/" /etc/mysql/mysql.conf.d/mysqld.cnf
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN cp /opt/shinobi/INSTALL/docker-install.sh /tmp/db.sh
RUN chmod +x /tmp/db.sh
RUN /tmp/db.sh
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
#VOLUME ["/var/log/mysql/"]
EXPOSE 8080
EXPOSE 3306
ENTRYPOINT ./docker-entrypoint.sh