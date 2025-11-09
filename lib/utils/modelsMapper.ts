import Box from "@/components/models/Box";
import { Cofee } from "@/components/models/Cofee";

export const modelsMapper: Record<string, React.FC<any>> = {
    '/models/box_.glb': Box,
    '/models/cofee.glb': Cofee
}