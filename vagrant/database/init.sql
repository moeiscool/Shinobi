# We include default installations of WordPress with this Vagrant setup.
# In order for that to respond properly, default databases should be
# available for use.
CREATE DATABASE IF NOT EXISTS `examine_store_dev`;
GRANT ALL PRIVILEGES ON `examine_store_dev`.* TO 'examine_dev'@'localhost' IDENTIFIED BY 'examine_dev';
CREATE DATABASE IF NOT EXISTS `examine_v5_dev`;
GRANT ALL PRIVILEGES ON `examine_v5_dev`.* TO 'examine_dev'@'localhost' IDENTIFIED BY 'examine_dev';

# Create an external user with privileges on all databases in mysql so
# that a connection can be made from the local machine without an SSH tunnel
GRANT ALL PRIVILEGES ON *.* TO 'external'@'%' IDENTIFIED BY 'external';