pm2 start server.js --watch -i 1 --name ngapi-server --log-date-format "YYYY-MM-DD HH:mm Z" --ignore-watch "logs files \.git \.vs \.idea static \.env .\public .\files .\migrations"
