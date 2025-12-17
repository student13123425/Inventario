declare const app: import("express-serve-static-core").Express;
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                shop_name: string;
                folder_hash: string;
            };
            admin?: {
                username: string;
                role: string;
            };
        }
    }
}
export default app;
