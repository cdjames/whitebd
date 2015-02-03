#!/usr/bin/env bash

apt-get update
# apt-get install -y lamp-server^ nodejs npm
apt-get install -y nodejs npm
if ! [ -L /var/www ]; then
  rm -rf /var/www
  ln -fs /vagrant /var/www
fi

if [ ! -d /vagrant/node_modules/express ]; then
  cd /vagrant; npm install --save express@4.10.2
fi

if [ ! -d /vagrant/node_modules/socket.io ]; then
  cd /vagrant; npm install --save socket.io
fi

node /vagrant/index.js
