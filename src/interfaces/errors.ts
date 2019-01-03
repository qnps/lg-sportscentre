export interface DatabaseError extends Error {
    code?: string;
    number?: number;
}

export interface WebError extends Error {
    statusCode?: string | number;
}