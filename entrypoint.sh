#!/bin/sh
set -e

if [ "$(id -u)" != "0" ]; then
    exec "$@"
fi

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"

chown -R "$PUID:$PGID" /srv/ninho/data
exec su-exec "$PUID:$PGID" "$@"
