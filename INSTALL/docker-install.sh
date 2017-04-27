#!/bin/bash
/etc/init.d/mysql start
/usr/bin/mysqld_safe &
sleep 5
mysql -u root -pnight -e "CREATE USER 'root'@'192.168.99.1' IDENTIFIED BY 'night';"
mysql -u root -pnight -e "GRANT ALL PRIVILEGES ON * . * TO 'root'@'192.168.99.1';"
mysql -u root -pnight -e "FLUSH PRIVILEGES;"
mysql -u root -pnight < /opt/shinobi/sql/user.sql
mysql -u root -pnight < /opt/shinobi/sql/framework.sql
mysql -u root -pnight --database ccio < /opt/shinobi/sql/default_data.sql