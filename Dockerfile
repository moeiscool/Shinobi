FROM danbelden:ubuntu-mysql56
MAINTAINER Moe Alam <shinobi@m03.ca>
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y ffmpeg nodejs npm libav-tools
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /opt/shinobi
COPY . /opt/shinobi
RUN cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
RUN chmod -R 755 /opt/shinobi
WORKDIR /opt/shinobi
RUN mysql -u root -proot -e "source /opt/shinobi/sql/user.sql" || true
RUN mysql -u root -proot -e "source /opt/shinobi/sql/framework.sql" || true
RUN mysql -u root -proot --database ccio -e "source /opt/shinobi/sql/default_data.sql" || true
RUN npm install
RUN npm install pm2 -g
RUN chmod +x ./docker-entrypoint.sh
VOLUME ['/opt/shinobi']
EXPOSE 8080
ENTRYPOINT ./docker-entrypoint.sh