FROM ubuntu:14.04

# nodejs
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    apt-get install -y nodejs

VOLUME /code
COPY package.json /code
WORKDIR /code

RUN npm install

VOLUME /shared

CMD ["tail", "-f", "/etc/hosts"]
# CMD ["npm", "start"]
