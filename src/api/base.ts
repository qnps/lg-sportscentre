import http = require('http');
import https = require('https');
import moment = require('moment-timezone');
import querystring = require('querystring');
import url = require('url');
const { URL } = url;

import { ApiError, NotImplementedError } from '../error';
import { ApiOptions, DailyStars, Game, League, NewsItem, TeamList } from '../types';

export default abstract class BaseApi {
    public readonly defaultTimezone: string;

    public constructor({ defaultTimezone = 'America/New_York' }: ApiOptions = {}) {
        this.defaultTimezone = defaultTimezone;

        this.get = this.get.bind(this);
        this.parseDate = this.parseDate.bind(this);
        this.parseResponse = this.parseResponse.bind(this);
        this.post = this.post.bind(this);
        this.request = this.request.bind(this);
    }

    protected get(url: string, options: https.RequestOptions = {}): Promise<any> {
        return this.request(url, { ...options, method: 'GET' });
    }

    protected parseDate(date: string, format?: string, timezone: string = this.defaultTimezone): moment.Moment {
        return moment.tz(date, format, timezone);
    }

    private parseResponse(data: string, contentType: string): any {
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
    }

    protected post(url: string, content: string | object, options: https.RequestOptions = {}): Promise<any> {
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
            }, (res: http.IncomingMessage) => {
                res.setEncoding('utf8');

                const { statusCode, statusMessage }: { statusCode?: number, statusMessage?: string } = res;
                const contentType: string = res.headers['content-type'];

                if (statusCode >= 300 && statusCode < 309) {
                    res.resume();
                    return this.post(new URL(res.headers.location, uri.href).href, content, options)
                        .then(resolve)
                        .catch(reject);
                } else if (statusCode !== 200) {
                    res.resume();
                    return reject(new ApiError(`${uri.href} returned ${statusCode} ${statusMessage}`, statusCode));
                }

                let data: string = '';
                res.on('data', (chunk: string) => data += chunk);
                res.on('end', () => resolve(this.parseResponse(data, contentType)));
            });

            req.on('error', (error: NodeJS.ErrnoException) => reject(new ApiError(error.message, error.code)));

            (content instanceof Object) && (content = querystring.stringify(content));
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Content-Length', Buffer.byteLength(content));
            req.write(content);
            req.end();
        });
    }

    protected request(url: string, options: https.RequestOptions = {}): Promise<any> {
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
            }, (res: http.IncomingMessage) => {
                res.setEncoding('utf8');

                const { statusCode, statusMessage }: { statusCode?: number, statusMessage?: string } = res;
                const contentType: string = res.headers['content-type'];

                if (statusCode >= 300 && statusCode < 309) {
                    res.resume();
                    return this.request(new URL(res.headers.location, uri.href).href, options)
                        .then(resolve)
                        .catch(reject);
                } else if (statusCode !== 200) {
                    res.resume();
                    return reject(new ApiError(`${uri.href} returned ${statusCode} ${statusMessage}`, statusCode));
                }

                let data: string = '';
                res.on('data', (chunk: string) => data += chunk);
                res.on('end', () => resolve(this.parseResponse(data, contentType)));
            });

            req.on('error', (error: NodeJS.ErrnoException) => reject(new ApiError(error.message, error.code)));
            req.end();
        });
    }
}