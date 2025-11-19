'use client';

import { useState, useEffect } from 'react'
import { IconType } from 'react-icons'
import { FaBoxes } from 'react-icons/fa'
import { IoHome, IoMenu, IoClose } from 'react-icons/io5'
import { GiPencilRuler } from 'react-icons/gi'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { FiShoppingCart } from 'react-icons/fi'
import { OrderDetails } from './OrderDetails';
import { useShoppingCartStore } from '@/lib/stores/ShoppingCart';

const links = [
    { id: 1, link: '/', label: 'Home', icon: IoHome },
    { id: 2, link: '/products', label: 'Products', icon: FaBoxes }
];

const Header = () => {
    const [viewCos, setViewCos] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { items, updateQuantity, removeItem } = useShoppingCartStore();
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);

    const closeCart = () => setViewCos(false);

    return (
        <div className="relative">
            <header className="
                bg-brown text-beige-light
                sticky top-0 z-50 shadow-md
                backdrop-blur-xl bg-opacity-95
            ">
                {/* === TOP BAR (MOBILE OPTIMIZED) === */}
                <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-[1200px] mx-auto">

                    {/* LOGO – compact, clar */}
                    <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileMenuOpen(false)}>
                        <GiPencilRuler className="w-7 h-7 text-terracotta" />
                        <span className="font-bold leading-tight text-sm">
                            <span className="block text-terracotta-light text-xs">Items</span>
                            <span className="block text-base text-beige-light">Personalizer</span>
                        </span>
                    </Link>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3">

                        {/* CART BUTTON */}
                        <button
                            onClick={() => setViewCos(true)}
                            className="
                                bg-beige-dark text-terracotta px-3 py-2 rounded-xl relative
                                shadow-sm active:scale-95 transition
                                flex items-center gap-2
                            "
                        >
                            <FiShoppingCart className="w-5 h-5" />

                            {/* HIDE LABEL on very small screens */}
                            <span className="hidden sm:inline text-sm font-semibold">Coș</span>

                            {totalItems > 0 && (
                                <span className="
                                    absolute -top-2 -right-2 bg-red-500 text-white text-xs
                                    font-bold rounded-full w-5 h-5 flex items-center justify-center
                                ">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </button>

                        {/* BURGER MENU */}
                        <button
                            className="md:hidden text-beige-light active:scale-95 transition"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen
                                ? <IoClose className="w-7 h-7" />
                                : <IoMenu className="w-7 h-7" />}
                        </button>

                    </div>
                </div>

                {/* === DESKTOP NAV === */}
                <nav className="hidden md:block border-t border-brown-dark">
                    <ul className="flex gap-4 py-3 px-6">
                        {links.map(l => {
                            const Icon = l.icon;
                            return (
                                <li key={l.id}>
                                    <Link
                                        href={l.link}
                                        className="flex items-center gap-2 text-beige-light hover:text-terracotta transition"
                                    >
                                        <Icon />
                                        {l.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* === MOBILE DROPDOWN === */}
                {mobileMenuOpen && (
                    <div className="
                        md:hidden bg-brown border-t border-brown-dark shadow-xl
                        px-5 py-5 space-y-5 animate-fade-down
                    ">
                        {/* NAV LINKS */}
                        <ul className="space-y-3">
                            {links.map(l => {
                                const Icon = l.icon;
                                return (
                                    <li key={l.id}>
                                        <Link
                                            href={l.link}
                                            className="flex items-center gap-3 text-beige-light py-2 px-3 rounded-lg bg-brown-dark/30"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {l.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* USER BLOCK */}
                        <div className="flex items-center gap-3 p-3 bg-brown-dark/40 rounded-xl">
                            <Avatar className="w-10 h-10 border border-beige-light/40">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">Utilizator</p>
                                <p className="text-sm opacity-75">Bine ai venit!</p>
                            </div>
                        </div>

                        {/* CART BLOCK */}
                        <div className="p-3 bg-brown-dark/40 rounded-xl">
                            <div className="flex justify-between items-center">
                                <span>Produse în coș</span>
                                <span className="bg-terracotta w-6 h-6 rounded-full text-white flex items-center justify-center text-sm">
                                    {totalItems}
                                </span>
                            </div>
                            <p className="text-sm opacity-70 mt-2">
                                {totalItems === 0
                                    ? 'Coșul este gol'
                                    : `${totalItems} produs(e)`}
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* OVERLAY */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <OrderDetails
                isOpen={viewCos}
                products={items}
                closeCart={closeCart}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
            />
        </div>
    );
};

export default Header;
