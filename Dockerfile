FROM node:16.15.1-alpine AS app-build
WORKDIR /my-storage-svc
COPY . .
RUN npm config set legacy-peer-deps true && npm ci --omit=dev

FROM gcr.io/distroless/nodejs:18
COPY --from=app-build  /my-storage-svc /my-storage-svc
WORKDIR /my-storage-svc

# run docker with --network="host"
CMD [ "index.js" ]