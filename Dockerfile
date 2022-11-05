FROM node:16
EXPOSE 3000
WORKDIR /usr/app
COPY . .
RUN npm install
ENTRYPOINT [ "npm", "start" ]