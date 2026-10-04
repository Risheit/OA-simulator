FROM linuxserver/code-server:latest

WORKDIR /config

# Config volume - links to editor_client directory
VOLUME /config

# Default environment variables
ENV PUID=1000 \
    PGID=1000 \
    TZ=Etc/UTC \
    PASSWORD=placeholder_password

# Expose default port
EXPOSE 8443

# Default command
CMD ["/bin/sh", "-c", "code-server --bind-addr 0.0.0.0:8443"]
