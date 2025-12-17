import express from 'express';
export declare function initializeAdmin(): Promise<void>;
export declare function generateAdminToken(username: string): string;
export declare function loginAdmin(username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}>;
export declare function changeAdminCredentials(currentUsername: string, currentPassword: string, newUsername: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction): express.Response<any, Record<string, any>> | undefined;
