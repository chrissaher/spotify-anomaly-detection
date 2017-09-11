#FROM python:3
FROM ubuntu:latest

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install sudo curl

RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo

USER docker
#CMD /bin/bash

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

WORKDIR /usr/src/app
ADD . /src
ADD ./start.sh /start.sh
RUN chmod 755 /start.sh

COPY requirements.txt ./
#RUN pip install --no-cache-dir -r requirements.txt

COPY . .
#CMD ["python", "./src/ws/webservice.py"]
CMD ["/bin/bash", "/start.sh"]
