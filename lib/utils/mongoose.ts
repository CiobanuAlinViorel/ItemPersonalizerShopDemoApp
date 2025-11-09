import mongoose from "mongoose";

const url = process.env.MONGO_URI;

// Validare la nivel de modul
if (!url) {
    throw new Error(
        "MONGO_URI is not defined. Please add it to your .env.local file"
    );
}

// Definim tipul pentru cache
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Cache pentru conexiune (previne memory leaks în development)
declare global {
    var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

export const connectMongoDb = async (): Promise<typeof mongoose> => {
    // Returnează conexiunea existentă dacă este disponibilă
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }

    // Creează o nouă promisiune de conexiune dacă nu există
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Dezactivează buffering pentru a vedea erorile imediat
        };

        cached.promise = mongoose.connect(url, opts).then((mongooseInstance) => {
            console.log(`MongoDB connected successfully to: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null; // Reset promise în caz de eroare
        console.error("MongoDB connection error:", error);
        throw error; // Re-aruncă eroarea pentru a o gestiona mai sus
    }

    return cached.conn;
};