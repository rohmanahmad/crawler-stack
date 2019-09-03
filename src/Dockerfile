FROM node:12.9.0

WORKDIR /usr/src/app

COPY App .
COPY Servers .
COPY package.json .

RUN "/bin/npm i"

CMD ["npm", "run", "dev"]
