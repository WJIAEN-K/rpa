# 静态落地页：根路径 / → index.html
# 构建阶段：自动拼装 src 分片，避免忘记手动执行 build-index.sh
FROM alpine:3.20 AS builder

RUN apk add --no-cache bash
WORKDIR /app

COPY src /app/src
COPY scripts /app/scripts
RUN bash /app/scripts/build-index.sh

FROM nginx:1.27-alpine

COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY assets /usr/share/nginx/html/assets
COPY src/img /usr/share/nginx/html/src/img
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
