#!/usr/bin/env bash
# Local single-node OpenSearch for dev/testing (security disabled, kNN bundled).
# Usage: scripts/dev-opensearch.sh [up|down|logs]
set -euo pipefail

NAME=portfolio-os
IMAGE=opensearchproject/opensearch:2.17.0

case "${1:-up}" in
  up)
    if docker ps -a --format '{{.Names}}' | grep -q "^${NAME}$"; then
      docker start "${NAME}" >/dev/null && echo "started existing ${NAME}"
    else
      docker run -d --name "${NAME}" \
        -p 9200:9200 -p 9600:9600 \
        --tmpfs /tmp:rw,exec,size=512m \
        -e "discovery.type=single-node" \
        -e "DISABLE_SECURITY_PLUGIN=true" \
        -e "DISABLE_INSTALL_DEMO_CONFIG=true" \
        -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
        "${IMAGE}" >/dev/null
      echo "created ${NAME}"
    fi
    echo -n "waiting for OpenSearch on :9200 "
    for _ in $(seq 1 60); do
      if curl -s http://localhost:9200 >/dev/null 2>&1; then echo " ready"; exit 0; fi
      echo -n "."; sleep 2
    done
    echo " timed out"; docker logs --tail 30 "${NAME}"; exit 1
    ;;
  down) docker rm -f "${NAME}" >/dev/null 2>&1 && echo "removed ${NAME}" || echo "not running" ;;
  logs) docker logs --tail 50 -f "${NAME}" ;;
  *) echo "usage: $0 [up|down|logs]"; exit 1 ;;
esac
