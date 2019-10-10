FROM ubuntu:16.04

# nodejs
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

WORKDIR /code
COPY package*.json /code/
RUN npm install

COPY ./entrypoint.sh /code/
ENTRYPOINT ["/code/entrypoint.sh"]