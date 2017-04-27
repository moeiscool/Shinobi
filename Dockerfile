FROM ubuntu:xenial
MAINTAINER Moe Alam <shinobi@m03.ca>
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y ffmpeg nodejs npm libav-tools wget
RUN echo 'mysql-server mysql-server/root_password password night' | debconf-set-selections
RUN echo 'mysql-server mysql-server/root_password_again password night' | debconf-set-selections
RUN apt-get -y install mysql-server --no-install-recommends
RUN sed -ie "s/^bind-address\s*=\s*127\.0\.0\.1$/bind-address = 0.0.0.0/" /etc/mysql/my.cnf 
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN mysql -u root -pnight -e "source /opt/shinobi/sql/user.sql" || true
RUN mysql -u root -pnight -e "source /opt/shinobi/sql/framework.sql" || true
RUN mysql -u root -pnight --database ccio -e "source /opt/shinobi/sql/default_data.sql" || true
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
VOLUME ['/opt/shinobi']
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh