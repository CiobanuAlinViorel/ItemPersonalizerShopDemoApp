import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { ShoppingCartItem } from '@/lib/types/ShoppingCart'
import { useCurrency } from '@/app/hooks/useCurrency'

type Props = {
    isOpen: boolean
    products: ShoppingCartItem[]
    closeCart: () => void
    updateQuantity: any
    removeItem: any
}

export const OrderDetails = ({ isOpen, products, closeCart, updateQuantity, removeItem }: Props) => {
    const [mounted, setMounted] = useState(false);
    const [localProducts, setLocalProducts] = useState<ShoppingCartItem[]>([]);
    const { formatPrice } = useCurrency();

    // Sincronizăm produsele locale cu cele primite ca props
    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    const handleQuantityChange = (id: string, newQuantity: number) => {
        updateQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id: string) => {
        // Elimină imediat din starea locală pentru animație
        setLocalProducts(prev => prev.filter(item => item.id !== id));

        // Apelează funcția removeItem din store
        removeItem(id);
    };

    const totalPrice = localProducts.reduce((sum, item) => {
        const price = item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price;
        return sum + (price * item.quantity);
    }, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-100">
            {/* Cart Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-linear-to-br from-beige-dark to-beige shadow-2xl transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="sticky top-0 bg-linear-to-r from-brown to-brown-dark p-6 shadow-lg z-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-terracotta/20 p-2 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-beige" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-beige-light">Coșul tău</h2>
                                <p className="text-sm text-beige/70">
                                    {localProducts.length} {localProducts.length === 1 ? 'produs' : 'produse'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-brown-dark/50 rounded-lg transition-all duration-300 group"
                        >
                            <X className="w-6 h-6 text-beige-light group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col h-[calc(100%-6rem)] overflow-y-auto z-100">
                    {!mounted || localProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-terracotta/20 blur-3xl rounded-full"></div>
                                <ShoppingCart className="w-24 h-24 text-beige relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-3">Coșul este gol</h3>
                            <p className="text-neutral-600 mb-8 max-w-xs">Adaugă produse pentru a începe personalizarea lor!</p>
                            <Link
                                href="/products"
                                onClick={closeCart}
                                className="group relative px-8 py-4 text-white bg-linear-to-r from-terracotta to-terracotta-light rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-linear-to-r from-terracotta-light to-terracotta opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative z-10 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Începe cumpărăturile
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 p-6 space-y-4">
                                {localProducts.map((item: ShoppingCartItem) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex gap-4 p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-brown-light/20 hover:border-terracotta/30"
                                    >
                                        {/* Discount Badge */}
                                        {item.discount > 0 && (
                                            <div className="absolute -top-2 -left-2 bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                                                -{item.discount}%
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden ring-2 ring-brown-light/30 group-hover:ring-terracotta/50 transition-all duration-300">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Product Info */}
                                            <h4 className="font-bold text-brown-dark truncate text-lg">{item.name}</h4>
                                            <p className="text-sm text-brown/60 capitalize bg-beige-dark/50 px-2 py-0.5 rounded-md w-fit mt-1">
                                                {item.type}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="font-bold text-xl text-terracotta">
                                                    {formatPrice(item.discount > 0
                                                        ? item.price * (1 - item.discount / 100)
                                                        : item.price
                                                    )}
                                                </span>
                                                {item.discount > 0 && (
                                                    <span className="text-sm text-brown/50 line-through">
                                                        {formatPrice(item.price)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center bg-beige-dark border-2 border-brown-light/30 rounded-xl overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-terracotta/20 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={16} className="text-brown-dark" />
                                                    </button>
                                                    <span className="px-4 py-1 text-base font-bold text-brown-dark min-w-10 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-terracotta/20 transition-colors duration-200"
                                                    >
                                                        <Plus size={16} className="text-brown-dark" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 group/delete"
                                                >
                                                    <Trash2 size={18} className="group-hover/delete:rotate-12 transition-transform duration-200" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer with Total */}
                            <div className="sticky bottom-0 bg-linear-to-r from-brown to-brown-dark p-6 shadow-2xl border-t-2 border-terracotta/30">
                                <div className="space-y-4">
                                    {/* Total */}
                                    <div className="flex items-center justify-between p-4 bg-beige-dark/20 rounded-xl backdrop-blur-sm">
                                        <span className="text-beige-light font-semibold text-lg">Total:</span>
                                        <span className="text-2xl font-bold text-terracotta-light">
                                            {formatPrice(totalPrice)}
                                        </span>
                                    </div>

                                    {/* Checkout Button */}
                                    <button className="group relative w-full py-4 bg-linear-to-r from-terracotta to-terracotta-light text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                                        <span className="absolute inset-0 bg-linear-to-r from-terracotta-light to-terracotta opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Finalizează comanda
                                            <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </span>
                                    </button>

                                    {/* Continue Shopping */}
                                    <Link
                                        href="/products"
                                        onClick={closeCart}
                                        className="block text-center text-beige-light hover:text-white font-medium transition-colors duration-300 underline decoration-terracotta/50 hover:decoration-terracotta underline-offset-4"
                                    >
                                        Continuă cumpărăturile
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}