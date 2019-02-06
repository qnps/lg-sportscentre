const https = require('https');
const moment = require('moment-timezone');
const querystring = require('querystring');
const { URL } = require('url');

const { ApiError } = require('../error');
const { checkAbstract } = require('../utils');

module.exports = class BaseApi {
    constructor({ defaultTimezone = 'America/New_York' } = {}) {
        checkAbstract(this, BaseApi);
        this.defaultTimezone = defaultTimezone;

        this.get = this.get.bind(this);
        this.parseDate = this.parseDate.bind(this);
        this.parseResponse = this.parseResponse.bind(this);
        this.post = this.post.bind(this);
        this.request = this.request.bind(this);
    }

    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    parseDate(date, format, timezone = this.defaultTimezone) {
        return moment.tz(date, format, timezone);
    }

    parseResponse(data, contentType) {
        try {
            if (/application\/json/.test(contentType)) {
                return JSON.parse(data);
            }
    
            if (/text\/(html|xml)/.test(contentType)) {
                return data.replace(/>\s+</g, '><');
            }
    
            return data;
        } catch (error) {
            throw new ApiError(error.message, null, error);
        }
    };

    post(url, content, options = {}) {
        return new Promise((resolve, reject) => {
            const uri = new URL(url);

            const req = https.request({
                ...options,
                method: 'POST',
                protocol: uri.protocol,
                host: uri.host,
                hostname: uri.hostname,
                port: uri.port,
                path: `${uri.pathname}${uri.search}`,
                headers: {
                    ...options.headers,
                }
            }, (res) => {
                res.setEncoding('utf8');

                const { statusCode, statusMessage } = res;
                const contentType = res.headers['content-type'];

                if (statusCode >= 300 && statusCode < 309) {
                    res.resume();

                    return this.post(new URL(res.headers.location, uri.href).href, content, options)
                        .then(resolve)
                        .catch(reject);
                } else if (statusCode !== 200) {
                    res.resume();

                    return reject(new ApiError(`${uri.href} returned ${statusCode} ${statusMessage}`, statusCode));
                }

                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(this.parseResponse(data, contentType)));
            });

            req.on('error', (error) => reject(new ApiError(error.message, error.code)));

            (content instanceof Object) && (content = querystring.stringify(content));
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Content-Length', Buffer.byteLength(content));
            req.write(content);
            req.end();
        });
    }

    request(url, options = {}) {
        return new Promise((resolve, reject) => {
            const uri = new URL(url);

            const req = https.request({
                method: 'GET',
                ...options,
                protocol: uri.protocol,
                host: uri.host,
                hostname: uri.hostname,
                port: uri.port,
                path: `${uri.pathname}${uri.search}`,
                headers: {
                    ...options.headers,
                }
            }, (res) => {
                res.setEncoding('utf8');

                const { statusCode, statusMessage } = res;
                const contentType = res.headers['content-type'];

                if (statusCode >= 300 && statusCode < 309) {
                    res.resume();

                    return this.request(new URL(res.headers.location, uri.href).href, options)
                        .then(resolve)
                        .catch(reject);
                } else if (statusCode !== 200) {
                    res.resume();

                    return reject(new ApiError(`${uri.href} returned ${statusCode} ${statusMessage}`, statusCode));
                }

                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(this.parseResponse(data, contentType)));
            });

            req.on('error', (error) => reject(new ApiError(error.message, error.code)));
            req.end();
        });
    }
};