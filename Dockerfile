FROM ubuntu:xenial
RUN apt update \
    && apt upgrade -y \
    && apt install -y ffmpeg nodejs npm libav-tools wget --no-install-recommends
RUN echo 'mysql-server mysql-server/root_password password night' | debconf-set-selections
RUN echo 'mysql-server mysql-server/root_password_again password night' | debconf-set-selections
RUN apt -y install mysql-server --no-install-recommends
RUN sed -ie "s/^bind-address\s*=\s*127\.0\.0\.1$/bind-address = 0.0.0.0/" /etc/mysql/mysql.conf.d/mysqld.cnf
RUN /etc/init.d/mysql start
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN /etc/init.d/mysql restart
RUN mysql -u root -pnight -e "source /opt/shinobi/sql/user.sql"
RUN mysql -u root -pnight -e "source /opt/shinobi/sql/framework.sql"
RUN mysql -u root -pnight --database ccio -e "source /opt/shinobi/sql/default_data.sql"
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
#VOLUME ["/var/log/mysql/"]
EXPOSE 8080
EXPOSE 3306
ENTRYPOINT ./docker-entrypoint.sh