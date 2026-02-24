#!/bin/sh
set -eu

cd /data

if ! tmux has-session -t mc 2>/dev/null; then
  tmux new-session -d -s mc "java -Xms${JAVA_XMS} -Xmx${JAVA_XMX} -jar ${SERVER_JAR} nogui"
fi

exec ttyd -W -p "${TTYD_PORT}" tmux attach -t mc
