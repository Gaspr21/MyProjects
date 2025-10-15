# Build stage
FROM golang:1.25.1 AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY src/ ./src

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./src

# Runtime stage
FROM alpine:latest
WORKDIR /app

COPY --from=builder /src/server .

EXPOSE 8080

CMD ["./server"]
