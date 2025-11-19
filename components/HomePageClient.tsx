"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Product3DCustomizer from "./Product3DCustomizer";
import Image from "next/image";
import { Product } from "@/lib/types/Product";

export const prdts: Product[] = [
    {
        id: 1,
        name: "Cutie Personalizabilă Premium",
        description: "Cutie din carton de calitate superioară, perfectă pentru cadouri și ambalaje personalizate. Rezistentă și elegantă.",
        price: 49.99,
        image: "/images/box.png",
        image3D: "/models/box_.glb",
        dimensions: {
            width: "20cm",
            length: "15cm",
            heigth: "10cm"
        },
        background: "#FFFFFF",
        texture: ""
    },
    {
        id: 2,
        name: "Cana cafea personalizabila",
        description: "Cana cafea de calitate superioară, perfectă pentru cadouri personalizate. Rezistentă și elegantă.",
        price: 49.99,
        image: "/images/cofee.jpeg",
        image3D: "/models/cofee.glb",
        dimensions: {
            width: "20cm",
            length: "15cm",
            heigth: "10cm"
        },
        background: "#FFFFFF",
        texture: ""
    },
    {
        id: 3,
        name: "Puzzle casa traditionala",
        description: "Puzzle casa traditionala",
        price: 49.99,
        image: "/images/house.jpg",
        image3D: "/models/house_animations.glb",
        dimensions: {
            width: "20cm",
            length: "15cm",
            heigth: "10cm"
        },
        background: "#FFFFFF",
        texture: ""
    }
];

export const HomePageClient = () => {
    const [openCustomizerId, setOpenCustomizerId] = useState<number | null>(null);

    const openCustomizer = (productId: number) => {
        setOpenCustomizerId(productId);
    };

    const closeCustomizer = () => {
        setOpenCustomizerId(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-liniar-to-b from-[#F5F2ED] to-beige p-6">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-5xl font-bold text-brown mb-3">
                    Personalizează-ți Produsele
                </h1>
                <p className="text-lg text-[#737373] max-w-2xl">
                    Creează produse unice cu designul tău. Adaugă text, logo-uri și alege culorile preferate.
                </p>
            </motion.div>

            <div className="space-y-8 w-full max-w-4xl">
                {prdts.map((product) => (
                    <div key={product.id}>
                        <Card className="w-full shadow-2xl rounded-2xl bg-white border-2 border-beige">
                            <CardContent className="p-8">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    {/* Previzualizare produs */}
                                    <motion.div
                                        className="relative"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <div className="w-full aspect-square bg-[#F5F2ED] rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={400}
                                                height={400}
                                                className="object-contain w-full h-full p-8"
                                                priority
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Detalii produs */}
                                    <motion.div
                                        className="space-y-6"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        <div>
                                            <h2 className="text-3xl font-bold text-brown mb-2">
                                                {product.name}
                                            </h2>
                                            <p className="text-[#737373] leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>

                                        {/* Preț */}
                                        <div className="bg-[#F5F2ED] p-4 rounded-lg">
                                            <p className="text-sm text-[#737373] mb-1">Preț</p>
                                            <p className="text-3xl font-bold text-brown">
                                                {product.price.toFixed(2)} RON
                                            </p>
                                        </div>

                                        {/* Dimensiuni */}
                                        <div className="bg-beige p-4 rounded-lg">
                                            <p className="text-sm text-[#737373] mb-2">Dimensiuni</p>
                                            <div className="flex gap-4 text-brown-dark font-semibold">
                                                <span>L: {product.dimensions.length}</span>
                                                <span className="text-[#737373]">|</span>
                                                <span>W: {product.dimensions.width}</span>
                                                <span className="text-[#737373]">|</span>
                                                <span>H: {product.dimensions.heigth}</span>
                                            </div>
                                        </div>

                                        {/* Buton de personalizare */}
                                        <Button
                                            onClick={() => openCustomizer(product.id)}
                                            className="w-full bg-brown hover:bg-brown-light text-white text-lg px-8 py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            🎨 Personalizează acum
                                        </Button>

                                        {/* Info suplimentare */}
                                        <div className="flex items-center gap-2 text-sm text-[#737373]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Salvează designul în format PNG și GLB</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modal Customizer pentru produsul curent */}
                        {openCustomizerId === product.id && (
                            <Product3DCustomizer
                                product={product}
                                onClose={closeCustomizer}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer info */}
            <motion.div
                className="mt-8 text-center text-sm text-[#737373]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <p>✨ Vizualizare 3D interactivă • 🎨 Editor 2D complet • 💾 Export profesional</p>
            </motion.div>
        </div>
    );
};