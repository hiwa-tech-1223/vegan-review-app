FROM golang:1.25-alpine

WORKDIR /app

# Install dependencies for hot reload
RUN go install github.com/air-verse/air@v1.52.3

# Install migrate tool
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.0

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8080

# Use air for hot reload during development
CMD ["air", "-c", ".air.toml"]
