module.exports = {
    appName: process.env.appName,
    appDescription: process.env.appDescription,
    apiVersion: process.env.apiVersion,
    clientVersion: process.env.clientVersion,
    redisDB: process.env.REDISDB,
    runtime: process.env.RUNTIME,
    restApiUrl: process.env.restApiUrl,
    port: parseInt(process.env.port),
    tokenExpirationDays: parseInt(process.env.tokenExpirationDays),
    tokenExpirationOffset: parseInt(process.env.tokenExpirationOffset),
    tokenKey: process.env.tokenKey,
    orgname: process.env.orgname,
    orgemail: process.env.orgemail,
    debug: process.env.debug,
    apiUrl:process.env.apiUrl,
    authApiUrl:process.env.authApiUrl,
    fileApiUrl:process.env.fileApiUrl,
    authFileApiUrl:process.env.authFileApiUrl,
    defaultOffset:process.env.defaultOffset,
    defaultRecordCount:process.env.defaultRecordCount,
    allowed_domain: process.env.allowed_domain,

    multer: {
        dest: process.env.multer_dest,
        limits: {
            fields: parseInt(process.env.multer_fields),
            fileSize: parseInt(process.env.multer_fileSize),
            files: parseInt(process.env.multer_files),
            parts: parseInt(process.env.multer_parts)
        }
    },

    db: {
        host: process.env.db_host,
        port: parseInt(process.env.db_port),
        user: process.env.db_user,
        password: process.env.db_password,
        database: process.env.db_name,
        connectTimeout:  parseInt(process.env.db_connect_timeout)

    },

}
