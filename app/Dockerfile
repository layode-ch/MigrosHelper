FROM php:8.5-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip

RUN docker-php-ext-install pdo pdo_mysql
WORKDIR /var/www/html

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer