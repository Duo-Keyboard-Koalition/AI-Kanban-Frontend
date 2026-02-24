FROM eclipse-temurin:17-jre

WORKDIR /data

ENV JAVA_XMS=1G
ENV JAVA_XMX=2G
ENV SERVER_JAR=spigot-1.20.1.jar
ENV MC_PORT=25565
ENV RCON_PORT=25575
ENV TTYD_PORT=7681

RUN apt-get update \
  && apt-get install -y --no-install-recommends ttyd tmux \
  && rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${MC_PORT}/tcp ${RCON_PORT}/tcp ${TTYD_PORT}/tcp

CMD ["/usr/local/bin/docker-entrypoint.sh"]
