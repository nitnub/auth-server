# FROM node:alpine
FROM node:14-alpine

WORKDIR /usr/auth-server

COPY package.json .

RUN npm install\
  && npm install typescript -g

COPY . .

RUN tsc

EXPOSE 4000

ENV PORT 4000

RUN npm run build

RUN npm install -g serve 
# CMD ["npm", "build"]
CMD ["serve", "-s", "build"]
