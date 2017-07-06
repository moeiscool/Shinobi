# Running docker

- modify .env with your appropriate values
  - at a minimum you should at least change:
    - MYSQL_VOLUME_DIR
    - VIDEOS_VOLUME_DIR
    - MYSQL_PASSWORD
    - MYSQL_ROOT_PASSWORD
    - ADMIN_PASSWORD=admin
- make sure you have docker installed and running
- make sure you have docker-compose installed
- run docker-compose
  ```
  docker-compose up -d
  ```
