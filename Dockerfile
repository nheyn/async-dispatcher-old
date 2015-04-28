FROM node:0.10

WORKDIR /var/async-dispatcher/

COPY ./src /var/async-dispatcher/src/
COPY ./__tests__ /var/async-dispatcher/__tests__/
COPY ./package.json /var/async-dispatcher/
RUN npm install