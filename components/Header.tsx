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

type Props = {}

type Links = {
    id: number,
    link: string,
    label: string,
    icon: IconType
}

const links: Links[] = [
    {
        id: 1,
        link: '/',
        label: 'Home',
        icon: IoHome
    },
    {
        id: 2,
        link: 'products',
        label: 'Products',
        icon: FaBoxes
    }
]

const Header = ({ }: Props) => {
    const [viewCos, setViewCos] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeCart = () => {
        setViewCos(false);
    }

    const {
        items,
        updateQuantity,
        removeItem
    } = useShoppingCartStore();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Detectează dispozitivul mobil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Închide meniul mobile când se face click pe un link
    const handleMobileLinkClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div>
            <header className='bg-linear-to-r from-brown via-brown-dark to-brown shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95'>
                <div className='container mx-auto flex items-center justify-between p-3 sm:p-4 px-4 sm:px-6'>
                    {/* Logo - Enhanced with hover effect */}
                    <Link
                        href={'/'}
                        className='transition-transform hover:scale-105 duration-300 shrink-0'
                        onClick={handleMobileLinkClick}
                    >
                        <div className='text-brown-light flex w-fit rounded-2xl items-center justify-center gap-2 sm:gap-3 bg-linear-to-br from-beige-dark to-beige border-2 border-brown-light p-2 sm:p-3 px-3 sm:px-5 font-bold text-base sm:text-lg shadow-md hover:shadow-xl transition-all duration-300 hover:border-terracotta'>
                            <GiPencilRuler className='w-6 h-6 sm:w-8 sm:h-8 text-terracotta animate-pulse' />
                            <span className='flex flex-col leading-tight'>
                                <span className='text-terracotta-light text-xs sm:text-sm tracking-wide'>Items</span>
                                <span className='text-brown-dark font-extrabold text-lg sm:text-xl'>Personalizer</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:block'>
                        <ul className='flex gap-2'>
                            {links.map(l => {
                                const Icon = l.icon;
                                return (
                                    <li key={l.id}>
                                        <Link
                                            href={l.link}
                                            className='group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-beige-light bg-brown hover:text-white transition-all duration-300 hover:bg-brown-dark/30 backdrop-blur-sm relative overflow-hidden'
                                        >
                                            <span className='absolute inset-0 bg-linear-to-r from-terracotta/0 via-terracotta/20 to-terracotta/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></span>
                                            <Icon className='text-beige group-hover:text-terracotta transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5 relative z-10' />
                                            <span className='font-medium text-sm sm:text-base relative z-10'>{l.label}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className='md:hidden'>
                        <Button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            variant="ghost"
                            size="icon"
                            className='text-beige-light hover:text-white hover:bg-brown-dark/30'
                        >
                            {mobileMenuOpen ? (
                                <IoClose className='w-6 h-6' />
                            ) : (
                                <IoMenu className='w-6 h-6' />
                            )}
                        </Button>
                    </div>

                    {/* User Section - Enhanced */}
                    <div className='flex gap-2 sm:gap-4 items-center'>
                        {/* Avatar with glow effect - Hidden on mobile */}
                        <div className='hidden sm:block relative group'>
                            <div className='absolute inset-0 bg-terracotta rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300'></div>
                            <Avatar className='w-9 h-9 sm:w-11 sm:h-11 border-2 border-beige-light hover:border-terracotta transition-all duration-300 relative z-10 ring-2 ring-brown-dark/30'>
                                <AvatarImage src="./avatar.png" alt="user" className='w-9 h-9 sm:w-11 sm:h-11' />
                                <AvatarFallback className='bg-beige text-brown-dark font-semibold text-sm'>U</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Cart Button - Enhanced */}
                        <div className='relative'>
                            <Button
                                className='flex gap-1 sm:gap-2 bg-linear-to-r from-beige-dark to-beige text-terracotta hover:text-terracotta-light font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-brown-light/30 text-sm sm:text-base'
                                onClick={() => setViewCos(!viewCos)}
                            >
                                <FiShoppingCart className='w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300' />
                                <span className='hidden sm:inline'>Coș cumpărături</span>
                                <span className='sm:hidden'>Coș</span>
                            </Button>

                            {/* Bulina SEPARATĂ de buton, cu z-index mai mare */}
                            {totalItems > 0 && (
                                <span className='absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg animate-pulse border border-white sm:border-2 z-20 text-[10px] sm:text-xs'>
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className='md:hidden absolute top-full left-0 right-0 bg-brown border-t border-brown-dark shadow-xl z-50'>
                        <div className='container mx-auto p-4'>
                            {/* Navigation Links */}
                            <nav className='mb-6'>
                                <ul className='space-y-2'>
                                    {links.map(l => {
                                        const Icon = l.icon;
                                        return (
                                            <li key={l.id}>
                                                <Link
                                                    href={l.link}
                                                    onClick={handleMobileLinkClick}
                                                    className='group flex items-center gap-3 px-4 py-3 rounded-xl text-beige-light hover:text-white transition-all duration-300 hover:bg-brown-dark/30 backdrop-blur-sm'
                                                >
                                                    <Icon className='text-beige group-hover:text-terracotta transition-colors duration-300 w-5 h-5' />
                                                    <span className='font-medium text-base'>{l.label}</span>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>

                            {/* User Info for Mobile */}
                            <div className='flex items-center gap-3 p-4 bg-brown-dark/30 rounded-xl'>
                                <Avatar className='w-10 h-10 border-2 border-beige-light'>
                                    <AvatarImage src="./avatar.png" alt="user" />
                                    <AvatarFallback className='bg-beige text-brown-dark font-semibold'>U</AvatarFallback>
                                </Avatar>
                                <div className='text-beige-light'>
                                    <p className='font-medium'>Utilizator</p>
                                    <p className='text-sm opacity-80'>Bine ai venit!</p>
                                </div>
                            </div>

                            {/* Cart Info for Mobile */}
                            <div className='mt-4 p-4 bg-brown-dark/30 rounded-xl text-beige-light'>
                                <div className='flex justify-between items-center'>
                                    <span className='font-medium'>Coș cumpărături</span>
                                    <span className='bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'>
                                        {totalItems}
                                    </span>
                                </div>
                                <p className='text-sm mt-2 opacity-80'>
                                    {totalItems === 0
                                        ? 'Coșul este gol'
                                        : `${totalItems} produs${totalItems > 1 ? 'e' : ''} în coș`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
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
    )
}

export default Header