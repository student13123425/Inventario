import express from 'express';
export declare function generateToken(userId: number, email: string): string;
export declare function verifyToken(token: string): any;
export declare function verifyTokenOwnership(token: string): Promise<{
    valid: boolean;
    user?: any;
    error?: string;
}>;
export declare function registerUser(shopName: string, email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}>;
export declare function loginUser(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}>;
export declare function requireResourceOwnership(paramName?: string): (req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
export declare function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response<any, Record<string, any>> | undefined>;
export declare function getAuthenticatedUser(req: express.Request): {
    id: number;
    email: string;
    shop_name: string;
    folder_hash: string;
};
export declare function decodeTokenForStats(token: string): {
    id: number;
    email: string;
} | null;
