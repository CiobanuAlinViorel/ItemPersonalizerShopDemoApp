'use client';

import { useState } from 'react'
import { IconType } from 'react-icons'
import { FaBoxes } from 'react-icons/fa'
import { IoHome } from 'react-icons/io5'
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
    const closeCart = () => {
        setViewCos(false);
    }

    const {
        items,
        updateQuantity,
        removeItem
    } = useShoppingCartStore();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div>
            <header className='bg-liniar-to-r from-brown via-brown-dark to-brown shadow-lg sticky top-0 z-10 backdrop-blur-sm bg-opacity-95 '>
                <div className='container mx-auto flex items-center justify-between p-4 px-6'>
                    {/* Logo - Enhanced with hover effect */}
                    <Link href={'/'} className='transition-transform hover:scale-105 duration-300'>
                        <div className='text-brown-light flex w-fit rounded-2xl items-center justify-center gap-3 bg-liniar-to-br from-beige-dark to-beige border-2 border-brown-light p-3 px-5 font-bold text-lg shadow-md hover:shadow-xl transition-all duration-300 hover:border-terracotta'>
                            <GiPencilRuler className='w-8 h-8 text-terracotta animate-pulse' />
                            <span className='flex flex-col leading-tight'>
                                <span className='text-terracotta-light text-sm tracking-wide'>Items</span>
                                <span className='text-brown-dark font-extrabold text-xl'>Personalizer</span>
                            </span>
                        </div>
                    </Link>

                    {/* Navigation - Enhanced with hover effects */}
                    <nav>
                        <ul className='flex gap-2'>
                            {links.map(l => {
                                const Icon = l.icon;
                                return (
                                    <li key={l.id}>
                                        <Link
                                            href={l.link}
                                            className='group flex items-center gap-2 px-5 py-2.5 rounded-xl text-beige-light bg-brown hover:text-white transition-all duration-300 hover:bg-brown-dark/30 backdrop-blur-sm relative overflow-hidden'
                                        >
                                            <span className='absolute inset-0 bg-linear-to-r from-terracotta/0 via-terracotta/20 to-terracotta/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></span>
                                            <Icon className='text-beige group-hover:text-terracotta transition-colors duration-300 w-5 h-5 relative z-10' />
                                            <span className='font-medium text-base relative z-10'>{l.label}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* User Section - Enhanced */}
                    <div className='flex gap-4 items-center'>
                        {/* Avatar with glow effect */}
                        <div className='relative group'>
                            <div className='absolute inset-0 bg-terracotta rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300'></div>
                            <Avatar className='w-11 h-11 border-2 border-beige-light hover:border-terracotta transition-all duration-300 relative z-10 ring-2 ring-brown-dark/30'>
                                <AvatarImage src="./avatar.png" alt="user" className='w-11 h-11' />
                                <AvatarFallback className='bg-beige text-brown-dark font-semibold'>U</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Cart Button - Enhanced */}
                        <div className='relative'>
                            <Button
                                className='flex gap-2 bg-liniar-to-r from-beige-dark to-beige text-terracotta hover:text-terracotta-light font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-brown-light/30'
                                onClick={() => setViewCos(!viewCos)}
                            >
                                <FiShoppingCart className='w-5 h-5 group-hover:rotate-12 transition-transform duration-300' />
                                <span>Coș cumpărături</span>
                            </Button>

                            {/* Bulina SEPARATĂ de buton, cu z-index mai mare */}
                            {totalItems > 0 && (
                                <span className='absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse border-2 border-white z-20'>
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>
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