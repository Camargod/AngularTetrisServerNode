FROM node:16
EXPOSE 3000
WORKDIR /usr/app
COPY ./ /usr/app
RUN cd /usr/app & npm install
ENTRYPOINT [ "npm start" ]