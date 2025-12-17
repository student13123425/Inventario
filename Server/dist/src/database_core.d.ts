import sqlite3 from 'sqlite3';
export declare const dataPath: string;
export declare const db: sqlite3.Database;
export declare function initializeDatabase(): Promise<void>;
export interface User {
    id: number;
    shop_name: string;
    email: string;
    password_hash: string;
    folder_hash: string;
}
export interface Product {
    ID?: number;
    name: string;
    price: number;
    nation_of_origin?: string;
    product_bar_code: string;
    expiration_date?: number;
}
export interface InventoryBatch {
    OrderID?: number;
    ProductID: number;
    purchase_price: number;
    sale_price: number;
    quantity: number;
    expiration_date_per_batch?: string;
}
export interface Customer {
    ID?: number;
    name: string;
    phone_number?: string;
    email?: string;
}
export interface Supplier {
    ID?: number;
    Name: string;
    phone_number?: string;
    email?: string;
}
export interface TransactionRecord {
    ID?: number;
    TransactionType: 'Purchase' | 'Sale';
    payment_type: 'paid' | 'owed';
    amount: number;
    SupplierID?: number;
    CustomerID?: number;
    TransactionDate: string;
    notes?: string;
}
export declare function getUserByEmail(email: string): Promise<User | undefined>;
export declare function getUserById(id: number): Promise<User | undefined>;
export declare function getAllUsers(): Promise<User[]>;
export declare function createUser(shopName: string, email: string, passwordHash: string, folderHash: string): Promise<number>;
export declare function init_user_data(path: string): void;
export declare function connectToUserDatabase(folderHash: string): Promise<sqlite3.Database>;
