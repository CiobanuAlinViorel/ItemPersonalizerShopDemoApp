import { ProductCustomization } from "../stores/ShoppingCart"

export type ShoppingCart = {
    _id: number,
    useId: number,
    lines: {
        item: ShoppingCartItem
        quantity: number
    },
    total: number

}

export type ShoppingCartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    image3D: string;
    type: string;
    discount: number;
    quantity: number;
    customization?: ProductCustomization;
}