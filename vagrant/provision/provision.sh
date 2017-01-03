#!/bin/bash
#
# provision.sh
#
# This file is specified in Vagrantfile and is loaded by Vagrant as the primary
# provisioning script whenever the commands `vagrant up`, `vagrant provision`,
# or `vagrant reload` are used. It provides all of the default packages and
# configurations included with Varying Vagrant Vagrants.

# By storing the date now, we can calculate the duration of provisioning at the
# end of this script.
start_seconds="$(date +%s)"

# PACKAGE INSTALLATION
#
# Build a bash array to pass all of the packages we want to install to a single
# apt-get command. This avoids doing all the leg work each time a package is
# set to install. It also allows us to easily comment out or add single
# packages. We set the array as empty to begin with so that we can append
# individual packages to it as required.
apt_package_install_list=()

# Start with a bash array containing all packages we want to install in the
# virtual machine. We'll then loop through each of these and check individual
# status before adding them to the apt_package_install_list array.
apt_package_check_list=(

  # PHP5
  #
  # Our base packages for php5. As long as php7.0-fpm and php7.0-cli are
  # installed, there is no need to install the general php5 package, which
  # can sometimes install apache as a requirement.
  php7.0-cli

  # Common and dev packages for php
  php7.0-common
  php7.0-dev

  # Extra PHP modules that we find useful
  #php-apcu
  #php-memcache
  php-imagick
  php7.0-mcrypt
  php7.0-mysql
  php7.0-imap
  php7.0-curl
  php-pear
  php7.0-gd
  php-mongodb
  php7.0-sqlite
  php7.0-json
  php7.0-imap
  #php-gearman
  php7.0-readline
  php-auth-sasl
  php7.0-xmlrpc
  php7.0-xsl
  php-geoip
  php7.0-intl
  php-oauth
  php7.0-pspell
  php7.0-mbstring

  # apache2 is installed as the default web server
  apache2
  libapache2-mod-php7.0

  # mysql is the default database
  mysql-server
  #mongodb

  # other packages that come in handy
  imagemagick
  git-core
  zip
  unzip
  ngrep
  curl
  make
  vim
  colordiff
  postfix

  # ntp service to keep clock current
  ntp
  htop
  sysstat
  dstat
  iotop
  python-pip
  python-apt
  screen

  # Req'd for i18n tools
  gettext

  # dos2unix
  # Allows conversion of DOS style line endings to something we'll have less
  # trouble with in Linux.
  dos2unix

  # nodejs
  g++
  nodejs
  nodejs-legacy
  npm

  # FFMPeg
  ffmpeg
  libav-tools
  x264
  x265

  #Mailcatcher requirement
  libsqlite3-dev
)

### FUNCTIONS

network_detection() {
  # Network Detection
  #
  # Make an HTTP request to google.com to determine if outside access is available
  # to us. If 3 attempts with a timeout of 5 seconds are not successful, then we'll
  # skip a few things further in provisioning rather than create a bunch of errors.
  if [[ "$(wget --tries=3 --timeout=5 --spider http://google.com 2>&1 | grep 'connected')" ]]; then
    echo "Network connection detected..."
    ping_result="Connected"
  else
    echo "Network connection not detected. Unable to reach google.com..."
    ping_result="Not Connected"
  fi
}

network_check() {
  network_detection
  if [[ ! "$ping_result" == "Connected" ]]; then
    echo -e "\nNo network connection available, skipping package installation"
    exit 0
  fi
}

noroot() {
  sudo -EH -u "ubuntu" "$@";
}

profile_setup() {
  # Copy custom dotfiles and bin file for the ubuntu user from local
  cp "/srv/config/bash_profile" "/home/ubuntu/.bash_profile"
  cp "/srv/config/bash_aliases" "/home/ubuntu/.bash_aliases"
  cp "/srv/config/vimrc" "/home/ubuntu/.vimrc"

  if [[ ! -d "/home/ubuntu/bin" ]]; then
    mkdir -p "/home/ubuntu/bin"
  fi

  rsync -rvzh --delete "/srv/config/homebin/" "/home/ubuntu/bin/"

  echo " * Copied /srv/config/bash_profile                      to /home/ubuntu/.bash_profile"
  echo " * Copied /srv/config/bash_aliases                      to /home/ubuntu/.bash_aliases"
  echo " * Copied /srv/config/vimrc                             to /home/ubuntu/.vimrc"
  echo " * rsync'd /srv/config/homebin                          to /home/ubuntu/bin"

  # If a bash_prompt file exists in the VVV config/ directory, copy to the VM.
  if [[ -f "/srv/config/bash_prompt" ]]; then
    cp "/srv/config/bash_prompt" "/home/ubuntu/.bash_prompt"
    echo " * Copied /srv/config/bash_prompt to /home/ubuntu/.bash_prompt"
  fi
}

package_check() {
  # Loop through each of our packages that should be installed on the system. If
  # not yet installed, it should be added to the array of packages to install.
  local pkg
  local package_version

  for pkg in "${apt_package_check_list[@]}"; do
    package_version=$(dpkg -s "${pkg}" 2>&1 | grep 'Version:' | cut -d " " -f 2)
    if [[ -n "${package_version}" ]]; then
      space_count="$(expr 20 - "${#pkg}")" #11
      pack_space_count="$(expr 30 - "${#package_version}")"
      real_space="$(expr ${space_count} + ${pack_space_count} + ${#package_version})"
      printf " * $pkg %${real_space}.${#package_version}s ${package_version}\n"
    else
      echo " *" $pkg [not installed]
      apt_package_install_list+=($pkg)
    fi
  done
}

package_install() {
  package_check

  # MySQL
  #
  # Use debconf-set-selections to specify the default password for the root MySQL
  # account. This runs on every provision, even if MySQL has been installed. If
  # MySQL is already installed, it will not affect anything.
  echo mysql-server mysql-server/root_password password "root" | debconf-set-selections
  echo mysql-server mysql-server/root_password_again password "root" | debconf-set-selections

  # Postfix
  #
  # Use debconf-set-selections to specify the selections in the postfix setup. Set
  # up as an 'Internet Site' with the host name 'vvv'. Note that if your current
  # Internet connection does not allow communication over port 25, you will not be
  # able to send mail, even with postfix installed.
  echo postfix postfix/main_mailer_type select Internet Site | debconf-set-selections
  echo postfix postfix/mailname string vvv | debconf-set-selections

  # Disable ipv6 as some ISPs/mail servers have problems with it
  echo "inet_protocols = ipv4" >> "/etc/postfix/main.cf"

  # Provide our custom apt sources before running `apt-get update`
  ln -sf /srv/config/apt-source-append.list /etc/apt/sources.list.d/vvv-sources.list
  echo "Linked custom apt sources"

  if [[ ${#apt_package_install_list[@]} = 0 ]]; then
    echo -e "No apt packages to install.\n"
  else
    # Before running `apt-get update`, we should add the public keys for
    # the packages that we are installing from non standard sources via
    # our appended apt source.list

    # Retrieve the Nginx signing key from nginx.org
    echo "Applying Nginx signing key..."
    wget --quiet "http://nginx.org/keys/nginx_signing.key" -O- | apt-key add -
    
    # Apply the nodejs assigning key
    apt-key adv --quiet --keyserver "hkp://keyserver.ubuntu.com:80" --recv-key C7917B12 2>&1 | grep "gpg:"
    apt-key export C7917B12 | apt-key add -

    # Adding FFMPEG 3 Repo for Ubuntu 16.04
    sudo add-apt-repository ppa:jonathonf/ffmpeg-3

    # Update all of the package references before installing anything
    echo "Running apt-get update..."
    apt-get update -y

    # Install required packages
    echo "Installing apt-get packages..."
    apt-get install -y ${apt_package_install_list[@]}

    # Clean up apt caches
    apt-get clean
  fi
}

tools_install() {
  # npm
  #
  # Make sure we have the latest npm version and the update checker module
  npm install -g npm
  npm install -g npm-check-updates
  npm install -g pm2

  # ack-grep
  #
  # Install ack-rep directory from the version hosted at beyondgrep.com as the
  # PPAs for Ubuntu Precise are not available yet.
  if [[ -f /usr/bin/ack ]]; then
    echo "ack-grep already installed"
  else
    echo "Installing ack-grep as ack"
    curl -s http://beyondgrep.com/ack-2.14-single-file > "/usr/bin/ack" && chmod +x "/usr/bin/ack"
  fi

  # COMPOSER
  #
  # Install Composer if it is not yet available.
  if [[ ! -n "$(composer --version --no-ansi | grep 'Composer version')" ]]; then
    echo "Installing Composer..."
    curl -sS "https://getcomposer.org/installer" | php
    chmod +x "composer.phar"
    mv "composer.phar" "/usr/local/bin/composer"
  fi

  if [[ -f /vagrant/provision/github.token ]]; then
    ghtoken=`cat /vagrant/provision/github.token`
    composer config --global github-oauth.github.com $ghtoken
    echo "Your personal GitHub token is set for Composer."
  fi

  # Update both Composer and any global packages. Updates to Composer are direct from
  # the master branch on its GitHub repository.
  if [[ -n "$(composer --version --no-ansi | grep 'Composer version')" ]]; then
    echo "Updating Composer..."
    COMPOSER_HOME=/usr/local/src/composer composer self-update
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update phpunit/phpunit:4.3.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update phpunit/php-invoker:1.1.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update mockery/mockery:0.9.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update d11wtq/boris:v1.0.8
    COMPOSER_HOME=/usr/local/src/composer composer -q global config bin-dir /usr/local/bin
    COMPOSER_HOME=/usr/local/src/composer composer global update
  fi
}

nginx_setup() {
  # Create an SSL key and certificate for HTTPS support.
  if [[ ! -e /etc/nginx/server.key ]]; then
	  echo "Generate Nginx server private key..."
	  vvvgenrsa="$(openssl genrsa -out /etc/nginx/server.key 2048 2>&1)"
	  echo "$vvvgenrsa"
  fi
  if [[ ! -e /etc/nginx/server.crt ]]; then
	  echo "Sign the certificate using the above private key..."
	  vvvsigncert="$(openssl req -new -x509 \
            -key /etc/nginx/server.key \
            -out /etc/nginx/server.crt \
            -days 3650 \
            -subj /CN=*.shinobi.dev/CN=*.shinobi.dashboard/CN=*.vvv.dev 2>&1)"
	  echo "$vvvsigncert"
  fi

  echo -e "\nSetup configuration files..."

  # Used to ensure proper services are started on `vagrant up`
  cp "/srv/config/init/vvv-start.conf" "/etc/init/vvv-start.conf"
  echo " * Copied /srv/config/init/vvv-start.conf               to /etc/init/vvv-start.conf"

  # Copy nginx configuration from local
  cp "/srv/config/nginx-config/nginx.conf" "/etc/nginx/nginx.conf"
  cp "/srv/config/nginx-config/nginx-wp-common.conf" "/etc/nginx/nginx-wp-common.conf"
  if [[ ! -d "/etc/nginx/custom-sites" ]]; then
    mkdir "/etc/nginx/custom-sites/"
  fi
  rsync -rvzh --delete "/srv/config/nginx-config/sites/" "/etc/nginx/custom-sites/"

  echo " * Copied /srv/config/nginx-config/nginx.conf           to /etc/nginx/nginx.conf"
  echo " * Copied /srv/config/nginx-config/nginx-wp-common.conf to /etc/nginx/nginx-wp-common.conf"
  echo " * Rsync'd /srv/config/nginx-config/sites/              to /etc/nginx/custom-sites"
}

phpfpm_setup() {
  # Copy php-fpm configuration from local
  cp "/srv/config/php5-fpm-config/php5-fpm.conf" "/etc/php5/fpm/php5-fpm.conf"
  cp "/srv/config/php5-fpm-config/www.conf" "/etc/php5/fpm/pool.d/www.conf"
  cp "/srv/config/php5-fpm-config/php-custom.ini" "/etc/php5/fpm/conf.d/php-custom.ini"
  cp "/srv/config/php5-fpm-config/opcache.ini" "/etc/php5/fpm/conf.d/opcache.ini"

  echo " * Copied /srv/config/php5-fpm-config/php5-fpm.conf     to /etc/php5/fpm/php5-fpm.conf"
  echo " * Copied /srv/config/php5-fpm-config/www.conf          to /etc/php5/fpm/pool.d/www.conf"
  echo " * Copied /srv/config/php5-fpm-config/php-custom.ini    to /etc/php5/fpm/conf.d/php-custom.ini"
  echo " * Copied /srv/config/php5-fpm-config/opcache.ini       to /etc/php5/fpm/conf.d/opcache.ini"

  # Copy memcached configuration from local
  cp "/srv/config/memcached-config/memcached.conf" "/etc/memcached.conf"

  echo " * Copied /srv/config/memcached-config/memcached.conf   to /etc/memcached.conf"
}

apache_setup() {
  # Create an SSL key and certificate for HTTPS support.
  if [[ ! -e /etc/ssl/private/server.key ]]; then
    echo "Generate Apache server private key..."
    vvvgenrsa="$(openssl genrsa -out /etc/ssl/private/server.key 2048 2>&1)"
    echo "$vvvgenrsa"
  fi
  if [[ ! -e /etc/ssl/certs/server.crt ]]; then
    echo "Sign the certificate using the above private key..."
    vvvsigncert="$(openssl req -new -x509 \
            -key /etc/ssl/private/server.key \
            -out /etc/ssl/certs/server.crt \
            -days 3650 \
            -subj /CN=*.shinobi.dev/CN=*.shinobi.dashboard/CN=*.vvv.dev 2>&1)"
    echo "$vvvsigncert"
  fi

  echo -e "\nSetup configuration files..."

  # Used to ensure proper services are started on `vagrant up`
  cp "/srv/config/init/vvv-start.conf" "/etc/init/vvv-start.conf"
  echo " * Copied /srv/config/init/vvv-start.conf               to /etc/init/vvv-start.conf"

  # Copy apache configuration from local
  cp "/srv/config/apache-config/apache2.conf" "/etc/apache2/apache2.conf"
  #cp "/srv/config/apache-config/nginx-wp-common.conf" "/etc/nginx/nginx-wp-common.conf"
  if [[ ! -d "/etc/apache2/sites-available" ]]; then
    mkdir -p "/etc/apache2/sites-available/"
  fi
  rsync -rvzh --delete "/srv/config/apache-config/sites-available/" "/etc/apache2/sites-available/"

  if [[ ! -d "/etc/apache2/conf/sites-enabled" ]]; then
    sudo mkdir -p "/etc/apache2/conf/sites-enabled/"
  fi
  sudo ln -s /etc/apache2/conf/sites-available/ /etc/apache2/conf/sites-enabled/

  echo " * Copied /srv/config/apache-config/apache2.conf           to /etc/apache/apache2.conf"
  echo " * Rsync'd /srv/config/apache-config/sites-available/      to /etc/apache/sites-available"
  echo " * Linked /etc/apache/sites-available        to /etc/apache/sites-enabled"

  a2enmod ssl expires headers rewrite
}

phpmod_setup() {
  # Copy php-fpm configuration from local
  cp "/srv/config/php5-config/php5.conf" "/etc/apache2/mods-available/php5.conf"
  cp "/srv/config/php5-config/php-custom.ini" "/etc/php5/apache2/conf.d/php-custom.ini"
  cp "/srv/config/php5-config/opcache.ini" "/etc/php5/mods-available/opcache.ini"

  echo " * Copied /srv/config/php5-config/php5.conf         to /etc/apache2/mods-available/php5.conf"
  echo " * Copied /srv/config/php5-config/php-custom.ini    to /etc/php5/apache2/conf.d/php-custom.ini"
  echo " * Copied /srv/config/php5-config/opcache.ini       to /etc/php5/mods-available/opcache.ini"
}

mysql_setup() {
  # If MySQL is installed, go through the various imports and service tasks.
  local exists_mysql

  exists_mysql="$(service mysql status)"
  if [[ "mysql: unrecognized service" != "${exists_mysql}" ]]; then
    echo -e "\nSetup MySQL configuration file links..."

    # Copy mysql configuration from local
    cp "/srv/config/mysql-config/my.cnf" "/etc/mysql/my.cnf"
    cp "/srv/config/mysql-config/root-my.cnf" "/home/ubuntu/.my.cnf"

    echo " * Copied /srv/config/mysql-config/my.cnf               to /etc/mysql/my.cnf"
    echo " * Copied /srv/config/mysql-config/root-my.cnf          to /home/ubuntu/.my.cnf"

    # MySQL gives us an error if we restart a non running service, which
    # happens after a `vagrant halt`. Check to see if it's running before
    # deciding whether to start or restart.
    if [[ "mysql stop/waiting" == "${exists_mysql}" ]]; then
      echo "service mysql start"
      service mysql start
      else
      echo "service mysql restart"
      service mysql restart
    fi

    # IMPORT SQL
    #
    # Create the databases (unique to system) that will be imported with
    # the mysqldump files located in database/backups/
    if [[ -f "/srv/database/init-custom.sql" ]]; then
      mysql -u "root" -p"root" < "/srv/database/init-custom.sql"
      echo -e "\nInitial custom MySQL scripting..."
    else
      echo -e "\nNo custom MySQL scripting found in database/init-custom.sql, skipping..."
    fi

    # Setup MySQL by importing an init file that creates necessary
    # users and databases that our vagrant setup relies on.
    mysql -u "root" -p"root" < "/srv/database/init.sql"
    echo "Initial MySQL prep..."

    # Process each mysqldump SQL file in database/backups to import
    # an initial data set for MySQL.
    "/srv/database/import-sql.sh"
  else
    echo -e "\nMySQL is not installed. No databases imported."
  fi
}

mongo_setup() {
  # If MySQL is installed, go through the various imports and service tasks.
  local exists_mongo

  exists_mongo="$(service mongodb status)"
  if [[ "mongodb: unrecognized service" != "${exists_mongo}" ]]; then
    echo -e "\nSetup MongoDB configuration file links..."

    # Copy mysql configuration from local
    #cp "/srv/config/mongo-config/my.cnf" "/etc/mysql/my.cnf"
    #cp "/srv/config/mongo-config/root-my.cnf" "/home/ubuntu/.my.cnf"

    #echo " * Copied /srv/config/mysql-config/my.cnf               to /etc/mysql/my.cnf"
    #echo " * Copied /srv/config/mysql-config/root-my.cnf          to /home/ubuntu/.my.cnf"

    # MySQL gives us an error if we restart a non running service, which
    # happens after a `vagrant halt`. Check to see if it's running before
    # deciding whether to start or restart.
    if [[ "mongodb stop/waiting" == "${exists_mongo}" ]]; then
      echo "service mongodb start"
      service mongodb start
      else
      echo "service mongodb restart"
      service mongodb restart
    fi

    # Process each mysqldump SQL file in database/backups to import
    # an initial data set for MySQL.
    "/srv/database/import-mongo.sh"
  else
    echo -e "\nMongoDB is not installed. No databases imported."
  fi
}

mailcatcher_setup() {
  # Mailcatcher
  #
  # Installs mailcatcher using RVM. RVM allows us to install the
  # current version of ruby and all mailcatcher dependencies reliably.
  local pkg

  rvm_version="$(/usr/bin/env rvm --silent --version 2>&1 | grep 'rvm ' | cut -d " " -f 2)"
  if [[ -n "${rvm_version}" ]]; then
    pkg="RVM"
    space_count="$(( 20 - ${#pkg}))" #11
    pack_space_count="$(( 30 - ${#rvm_version}))"
    real_space="$(( ${space_count} + ${pack_space_count} + ${#rvm_version}))"
    printf " * $pkg %${real_space}.${#rvm_version}s ${rvm_version}\n"
  else
    # RVM key D39DC0E3
    # Signatures introduced in 1.26.0
    gpg -q --no-tty --batch --keyserver "hkp://keyserver.ubuntu.com:80" --recv-keys D39DC0E3
    gpg -q --no-tty --batch --keyserver "hkp://keyserver.ubuntu.com:80" --recv-keys BF04FF17

    printf " * RVM [not installed]\n Installing from source"
    curl --silent -L "https://get.rvm.io" | sudo bash -s stable --ruby
    source "/usr/local/rvm/scripts/rvm"
  fi

  mailcatcher_version="$(/usr/bin/env mailcatcher --version 2>&1 | grep 'mailcatcher ' | cut -d " " -f 2)"
  if [[ -n "${mailcatcher_version}" ]]; then
    pkg="Mailcatcher"
    space_count="$(( 20 - ${#pkg}))" #11
    pack_space_count="$(( 30 - ${#mailcatcher_version}))"
    real_space="$(( ${space_count} + ${pack_space_count} + ${#mailcatcher_version}))"
    printf " * $pkg %${real_space}.${#mailcatcher_version}s ${mailcatcher_version}\n"
  else
    echo " * Mailcatcher [not installed]"
    /usr/bin/env rvm default@mailcatcher --create do gem install mailcatcher --no-rdoc --no-ri
    /usr/bin/env rvm wrapper default@mailcatcher --no-prefix mailcatcher catchmail
  fi

  if [[ -f "/etc/init/mailcatcher.conf" ]]; then
    echo " *" Mailcatcher upstart already configured.
  else
    cp "/srv/config/init/mailcatcher.conf"  "/etc/init/mailcatcher.conf"
    echo " * Copied /srv/config/init/mailcatcher.conf    to /etc/init/mailcatcher.conf"
  fi

  if [[ -f "/etc/php5/mods-available/mailcatcher.ini" ]]; then
    echo " *" Mailcatcher php5 fpm already configured.
  else
    cp "/srv/config/php5-fpm-config/mailcatcher.ini" "/etc/php5/mods-available/mailcatcher.ini"
    echo " * Copied /srv/config/php5-fpm-config/mailcatcher.ini    to /etc/php5/mods-available/mailcatcher.ini"
  fi
}

services_restart() {
  # RESTART SERVICES
  #
  # Make sure the services we expect to be running are running.
  echo -e "\nRestart services..."
  #service memcached restart
  service mailcatcher restart

  # Enable PHP mcrypt module by default
  phpenmod mcrypt

  # Enable PHP mailcatcher sendmail settings by default
  phpenmod mailcatcher

  # restart webserver
  #service apache2 restart
  
  # Add the vagrant user to the www-data group so that it has better access
  # to PHP and Nginx related files.
  usermod -a -G www-data ubuntu
}

memcached_admin() {
  # Download and extract phpMemcachedAdmin to provide a dashboard view and
  # admin interface to the goings on of memcached when running
  if [[ ! -d "/srv/www/default/memcached-admin" ]]; then
    echo -e "\nDownloading phpMemcachedAdmin, see https://github.com/wp-cloud/phpmemcacheadmin"
    cd /srv/www/default
    wget -q -O phpmemcachedadmin.tar.gz "https://github.com/wp-cloud/phpmemcacheadmin/archive/1.2.2.1.tar.gz"
    tar -xf phpmemcachedadmin.tar.gz
    mv phpmemcacheadmin* memcached-admin
    rm phpmemcachedadmin.tar.gz
  else
    echo "phpMemcachedAdmin already installed."
  fi
}

opcached_status(){
  # Checkout Opcache Status to provide a dashboard for viewing statistics
  # about PHP's built in opcache.
  if [[ ! -d "/srv/www/default/opcache-status" ]]; then
    echo -e "\nDownloading Opcache Status, see https://github.com/rlerdorf/opcache-status/"
    cd /srv/www/default
    git clone "https://github.com/rlerdorf/opcache-status.git" opcache-status
  else
    echo -e "\nUpdating Opcache Status"
    cd /srv/www/default/opcache-status
    git pull --rebase origin master
  fi
}

phpmyadmin_setup() {
  # Download phpMyAdmin
  if [[ ! -d /srv/www/default/database-admin ]]; then
    echo "Downloading phpMyAdmin..."
    cd /srv/www/default
    wget -q -O phpmyadmin.tar.gz "https://files.phpmyadmin.net/phpMyAdmin/4.4.10/phpMyAdmin-4.4.10-all-languages.tar.gz"
    tar -xf phpmyadmin.tar.gz
    mv phpMyAdmin-4.4.10-all-languages database-admin
    rm phpmyadmin.tar.gz
  else
    echo "PHPMyAdmin already installed."
  fi
  cp "/srv/config/phpmyadmin-config/config.inc.php" "/srv/www/default/database-admin/"
}

custom_vvv(){
  # Find new sites to setup.
  # Kill previously symlinked Nginx configs
  # We can't know what sites have been removed, so we have to remove all
  # the configs and add them back in again.
  find /etc/nginx/custom-sites -name 'vvv-auto-*.conf' -exec rm {} \;

  # Look for site setup scripts
  for SITE_CONFIG_FILE in $(find /srv/www -maxdepth 5 -name 'vvv-init.sh'); do
    DIR="$(dirname "$SITE_CONFIG_FILE")"
    (
    cd "$DIR"
    source vvv-init.sh
    )
  done

  # Look for Nginx vhost files, symlink them into the custom sites dir
  for SITE_CONFIG_FILE in $(find /srv/www -maxdepth 5 -name 'vvv-nginx.conf'); do
    DEST_CONFIG_FILE=${SITE_CONFIG_FILE//\/srv\/www\//}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE//\//\-}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE/%-vvv-nginx.conf/}
    DEST_CONFIG_FILE="vvv-auto-$DEST_CONFIG_FILE-$(md5sum <<< "$SITE_CONFIG_FILE" | cut -c1-32).conf"
    # We allow the replacement of the {vvv_path_to_folder} token with
    # whatever you want, allowing flexible placement of the site folder
    # while still having an Nginx config which works.
    DIR="$(dirname "$SITE_CONFIG_FILE")"
    sed "s#{vvv_path_to_folder}#$DIR#" "$SITE_CONFIG_FILE" > "/etc/nginx/custom-sites/""$DEST_CONFIG_FILE"
  done

  # Parse any vvv-hosts file located in www/ or subdirectories of www/
  # for domains to be added to the virtual machine's host file so that it is
  # self aware.
  #
  # Domains should be entered on new lines.
  echo "Cleaning the virtual machine's /etc/hosts file..."
  sed -n '/# vvv-auto$/!p' /etc/hosts > /tmp/hosts
  mv /tmp/hosts /etc/hosts
  echo "Adding domains to the virtual machine's /etc/hosts file..."
  find /srv/www/ -maxdepth 5 -name 'vvv-hosts' | \
  while read hostfile; do
    while IFS='' read -r line || [ -n "$line" ]; do
      if [[ "#" != ${line:0:1} ]]; then
        if [[ -z "$(grep -q "^127.0.0.1 $line$" /etc/hosts)" ]]; then
          echo "127.0.0.1 $line # vvv-auto" >> "/etc/hosts"
          echo " * Added $line from $hostfile"
        fi
      fi
    done < "$hostfile"
  done
}

shinobi_install(){
  # Checkout, install and configure
  if [[ ! -d "/home/shinobi" ]]; then
    echo "Installing Shinobi settings..."

    mkdir -p /home/shinobi

    shinobi_install
    
  else
    echo "Updating Shinobi settings..."
    cd /home/shinobi/
    
    rsync -avz /srv/config/shinobi-config/* --exclude=README.md ./

    echo "Updating npm packages..."
    noroot npm install &>/dev/null

    echo "Initial MySQL Database..."
    mysql -u "root" -p"root" < "/home/shinobi/sql/framework.sql"

    echo "Default Data..."
    mysql -u "root" -p"root" ccio < "/home/shinobi/sql/default_data.sql"

    # Start Shinobi
    noroot pm2 start /home/shinobi/camera.js
    
  fi
}

### SCRIPT
#set -xv

network_check
# Profile_setup
echo "Bash profile setup and directories."
profile_setup

network_check
# Package and Tools Install
echo " "
echo "Main packages check and install."
package_install
tools_install
apache_setup
mailcatcher_setup
phpmod_setup
services_restart
mysql_setup
#mongo_setup

network_check
# Debugging tools
echo " "
echo "Installing/updating debugging tools"

opcached_status
phpmyadmin_setup

network_check

# Time for Install!
echo " "
echo "Installing/updating Shinobi"

shinobi_install

# VVV custom site import
echo " "
#echo "VVV custom site import"
#custom_vvv

#set +xv
# And it's done
end_seconds="$(date +%s)"
echo "-----------------------------"
echo "Provisioning complete in "$((${end_seconds} - ${start_seconds}))" seconds"
echo "Visit http://shinobi.dev:8080/ to start"
