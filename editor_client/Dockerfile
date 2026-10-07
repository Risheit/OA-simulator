FROM linuxserver/code-server:latest

ENV PUID=1000
ENV PGID=1000 

EXPOSE 8443

CMD ["/bin/sh", "-c", "code-server --bind-addr 0.0.0.0:8443"]
