export interface Product {
    id: number,
    name: string,
    description: string,
    price: number,
    image: string,
    image3D: string,
    dimensions: {
        width: string,
        length: string,
        heigth: string,
    }
    background: string,
    texture: string

}