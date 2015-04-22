FROM node:0.10

RUN npm install -g babel

WORKDIR /var/www/
COPY ./package.json /var/www/
RUN npm install

COPY ./src /var/www/src/

EXPOSE 80