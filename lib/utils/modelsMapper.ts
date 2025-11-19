import Box from "@/components/models/Box";
import { Cofee } from "@/components/models/Cofee";
import { House } from "@/components/models/House";
import { HouseA } from "@/components/models/One";

export const modelsMapper: Record<string, React.FC<any>> = {
    '/models/box_.glb': Box,
    '/models/cofee.glb': Cofee,
    '/models/house.glb': House,
    '/models/house_animations.glb': HouseA
}