FROM jrottenberg/ffmpeg:ubuntu
COPY . /opt/shinobi
WORKDIR /opt/shinobi

ENV MYSQL_HOST="127.0.0.1" \
    MYSQL_DATABASE="shinobi" \
    MYSQL_ROOT_USER="root" \
    MYSQL_ROOT_PASSWORD="rootpass" \
    MYSQL_USER="ccio" \
    MYSQL_PASSWORD="shinobi" \
	TIMEZONE="UTC"

RUN apt update \
	&& echo mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD | debconf-set-selections \
	&& echo mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD | debconf-set-selections \
	&& apt-get install -y mysql-server mysql-client libmysqlclient-dev \
	&& apt install -y curl \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash \
    && apt install --no-install-recommends -y nodejs libav-tools \
    wget libcairo2-dev libjpeg-dev libpango1.0-dev \
    libgif-dev build-essential g++ \
	&& apt clean \
    && rm -rf /var/lib/apt/lists/* \
    && cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json \
    && cp /opt/shinobi/super.sample.json /opt/shinobi/super.json \
    && npm install \
    && npm install pm2 -g \
	&& npm install canvas \
    && chmod +x ./docker-entrypoint.sh \
    && cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json

VOLUME ["/opt/shinobi/videos"]
VOLUME ["/var/lib/mysql"]
EXPOSE 8080
EXPOSE 3306
ENTRYPOINT ./docker-entrypoint.sh
