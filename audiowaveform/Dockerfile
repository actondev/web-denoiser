FROM ubuntu:14.04

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:chris-needham/ppa -y && \
    apt-get update && \
    apt-get install audiowaveform -y

# nodejs
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    apt-get install -y nodejs


WORKDIR /code
COPY package*.json /code/
RUN npm install

VOLUME /shared

COPY ./entrypoint.sh /code/
ENTRYPOINT ["/code/entrypoint.sh"]