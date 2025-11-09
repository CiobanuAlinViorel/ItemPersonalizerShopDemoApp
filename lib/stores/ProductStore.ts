import { Product } from "@/lib/types/Product";
import { create } from "zustand";

type ProductsState = {
    products: Product[],
    setProducts: () => void;
}

export const useProductStore = create<ProductsState>((set, get) => ({
    products: [],
    async setProducts() {
        const products: Product[] = [];
        set({ products })
    },
}))