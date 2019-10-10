#!/bin/bash

set -e #  Exit immediately if a command exits with a non-zero status.

if [[ "$NODE_ENV" == "development" ]]; then
  echo "NODE_ENV in development mode, not preparing anything"
else
  npm run build
fi

if [[ "$DEBUG" -eq 2 ]]; then
  exec tail -f /etc/hosts
elif [[ "$DEBUG" -eq 1 ]]; then
  exec npm run debug
else
  exec npm start
fi