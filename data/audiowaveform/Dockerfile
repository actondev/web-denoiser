FROM ubuntu:14.04
VOLUME /src

# audiowaveform
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:chris-needham/ppa -y && \
    apt-get update && \
    apt-get install audiowaveform -y

# nodejs
RUN apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    apt-get install -y nodejs

COPY . /code
WORKDIR /code

RUN npm install

VOLUME /share

# CMD ["/bin/bash"]
# CMD ["tail", "-f", "/etc/hosts"]
CMD ["npm", "start"]
