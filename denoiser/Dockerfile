FROM ubuntu:18.04

# nodejs
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

# python
RUN apt-get update && apt-get install -y \
    python3-pip

# necessary files for our python modules
RUN apt-get install -y \
    libffi-dev \
    libsndfile1 \
    libfreetype6-dev \
    libxft-dev

# installing ffmpeg: converting all files to wav with  known encoding & samplerate
RUN apt-get update && \
    apt-get install ffmpeg --no-install-recommends -y

WORKDIR /code
COPY package*.json /code/
RUN npm install

RUN pip3 install numpy
COPY wavelet-denoiser/requirements.txt /code
RUN pip3 install -r requirements.txt

COPY ./entrypoint.sh /code/
ENTRYPOINT ["/code/entrypoint.sh"]