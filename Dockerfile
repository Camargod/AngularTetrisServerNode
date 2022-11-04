FROM node:16
WORKDIR /usr/app
COPY ./ /usr/app
RUN cd /usr/app & npm install
ENTRYPOINT [ "npm start" ]