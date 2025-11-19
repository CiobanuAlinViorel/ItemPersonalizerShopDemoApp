import { Vector3 } from "three"

export interface PuzzlePiece {
    _id: number
    step: number,
    partName: string,
    glb: string,
    position: number[],
    rotation: number[],
    scale: number[],
    isMobile: boolean,
    bounds: { max: number[], min: number[] }
    svg: string
    placementDir: { start: Vector3, end: Vector3 }
}

export interface IPuzzleSteps {
    stepNumber: number,
    description: string
}

export interface IPuzzle {
    _id: string,
    name: string,
    image: string,
    model3D: string,
    pieces: PuzzlePiece[],
    steps: IPuzzleSteps[],
}

export const puzzles: IPuzzle[] = [
    {
        "_id": "123",
        "name": "House Puzzle",
        "image": "/images/house.jpg",

        "model3D": "/models/house.glb",
        "pieces": [
            {
                _id: 1,
                "step": 1,
                "partName": "foundation",
                "glb": "/models/house_puzzle/1.glb",
                "position": [5.5, -1.3, 0.1],
                scale: [0.1, 0.3, 0.3],
                svg: "/puzzle/casa2Elemente/podea.svg",
                "rotation": [-2.52, 1.64, -0.71],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 1, 0)
                }
            },
            {
                _id: 2,
                "step": 2,
                "partName": "back wall",
                "glb": "/models/house_puzzle/3.glb",
                "position": [2.3, -1.7, 0.1],
                scale: [0.3, 0.3, 0.3],
                svg: "/puzzle/casa2Elemente/perete-spate.svg",
                "rotation": [-2.89, 1.63, -0.58],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 3,
                "step": 2,
                "partName": "front wall",
                "glb": "/models/house_puzzle/2.glb",
                "position": [-1, -1.6, -1],
                scale: [0.3, 0.3, 0.3],
                svg: "/puzzle/casa2Elemente/perete-fata.svg",
                "rotation": [-3.17, -0.01, -6.28],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 4,
                "step": 3,
                "partName": "right wall",
                "glb": "/models/house_puzzle/5.glb",
                "position": [-3.5, -3, -1],
                scale: [0.3, 0.3, 0.3],
                svg: "/puzzle/casa2Elemente/perete-dreapta.svg",
                "rotation": [3.06, -3.45, -3.31],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 0, 6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 5,
                "step": 3,
                "partName": "left wall",
                "glb": "/models/house_puzzle/4.glb",
                "position": [0, 0.877, -3.389],
                "rotation": [0, 0, 0],
                scale: [1, 1, 1],
                "isMobile": false,
                svg: "/puzzle/casa2Elemente/perete-stanga.svg",
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 0, -6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 6,
                "step": 4,
                "partName": "ceiling",
                "glb": "/models/house_puzzle/6.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                svg: "/puzzle/casa2Elemente/tavan.svg",
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 7,
                "step": 5,
                "partName": "left door",
                "glb": "/models/house_puzzle/13.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                svg: "/puzzle/casa2Elemente/portita-stanga.svg",
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 8,
                "step": 5,
                "partName": "right door",
                "glb": "/models/house_puzzle/14.glb",
                "position": [0, 0.877, -3.389],
                svg: "/puzzle/casa2Elemente/portita-dreapta.svg",
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 9,
                "step": 6,
                "partName": "outer right door",
                "glb": "/models/house_puzzle/9.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                svg: "/puzzle/casa2Elemente/portita-dreapta-extrem.svg",
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 10,
                "step": 6,
                "partName": "outer left door",
                "glb": "/models/house_puzzle/10.glb",
                "position": [0, 0.877, -3.389],
                svg: "/puzzle/casa2Elemente/portita-stanga-extrem.svg",
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 11,
                "step": 7,
                "partName": "outer right wall",
                "glb": "/models/house_puzzle/7.glb",
                "position": [0, 0.877, -3.389],
                svg: "/puzzle/casa2Elemente/perete-exterior-dreapta.svg",
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 12,
                "step": 7,
                "partName": "outer left wall",
                "glb": "/models/house_puzzle/8.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                svg: "/puzzle/casa2Elemente/perete-exterior-stanga.svg",
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 13,
                "step": 8,
                "partName": "outer front wall",
                "glb": "/models/house_puzzle/11.glb",
                svg: "/puzzle/casa2Elemente/perete-exterior-fata.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 14,
                "step": 9,
                "partName": "fronter part",
                "glb": "/models/house_puzzle/12.glb",
                svg: "/puzzle/casa2Elemente/fatada-casa.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 15,
                "step": 10,
                "partName": "front roof",
                "glb": "/models/house_puzzle/15.glb",
                svg: "/puzzle/casa2Elemente/acoperis-spate.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 16,
                "step": 11,
                "partName": "back roof",
                "glb": "/models/house_puzzle/16.glb",
                svg: "/puzzle/casa2Elemente/acoperis-spate.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 17,
                "step": 12,
                "partName": "right roof",
                "glb": "/models/house_puzzle/17.glb",
                svg: "/puzzle/casa2Elemente/acoperis-dreapta.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 18,
                "step": 13,
                "partName": "left roof",
                "glb": "/models/house_puzzle/18.glb",
                svg: "/puzzle/casa2Elemente/acoperis-stanga.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 19,
                "step": 14,
                "partName": "front right decoration roof",
                svg: "/puzzle/casa2Elemente/acoperis-frontal-dreapta.svg",
                "glb": "/models/house_puzzle/19.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 20,
                "step": 15,
                "partName": "front left decoration roof",
                svg: "/puzzle/casa2Elemente/acoperis-frontal-stanga.svg",
                "glb": "/models/house_puzzle/20.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": false,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            // for mobile 
            {
                _id: 21,
                "step": 1,
                "partName": "foundation-mobile",
                "glb": "/models/house_puzzle/1.glb",
                svg: "/puzzle/casa2Elemente/podea.svg",
                "position": [0, 0, 0],
                scale: [0.5, 0.5, 0.5],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [2.35, 1.2, 1],
                    "min": [-2.35, -1.2, -1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 1, 0)
                }
            },
            {
                _id: 22,
                "step": 2,
                "partName": "back wall mobile",
                "glb": "/models/house_puzzle/3.glb",
                svg: "/puzzle/casa2Elemente/perete-spate.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 23,
                "step": 2,
                "partName": "front wall mobile",
                "glb": "/models/house_puzzle/2.glb",
                svg: "/puzzle/casa2Elemente/perete-fata.svg",
                scale: [1, 1, 1],
                "position": [0, 0.877, -3.389],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 24,
                "step": 3,
                "partName": "right wall mobile",
                svg: "/puzzle/casa2Elemente/perete-dreapta.svg",
                "glb": "/models/house_puzzle/5.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 0, 6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 25,
                "step": 3,
                "partName": "left wall mobile",
                "glb": "/models/house_puzzle/4.glb",
                svg: "/puzzle/casa2Elemente/perete-stanga.svg",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 0, -6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 26,
                "step": 4,
                "partName": "ceiling mobile",
                svg: "/puzzle/casa2Elemente/tavan.svg",
                "glb": "/models/house_puzzle/6.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 27,
                "step": 5,
                "partName": "left door mobile",
                svg: "/puzzle/casa2Elemente/portita-stanga.svg",
                "glb": "/models/house_puzzle/13.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 28,
                "step": 5,
                "partName": "right door mobile",
                svg: "/puzzle/casa2Elemente/portita-dreapta.svg",
                "glb": "/models/house_puzzle/14.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 29,
                "step": 6,
                svg: "/puzzle/casa2Elemente/portita-dreapta-extrem.svg",
                "partName": "outer right door mobile",
                "glb": "/models/house_puzzle/9.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 30,
                "step": 6,
                svg: "/puzzle/casa2Elemente/portita-stanga-extrem.svg",
                "partName": "outer left door mobile",
                "glb": "/models/house_puzzle/10.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 31,
                "step": 7,
                svg: "/puzzle/casa2Elemente/perete-exterior-dreapta.svg",
                "partName": "outer right wall mobile",
                "glb": "/models/house_puzzle/7.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 32,
                "step": 7,
                svg: "/puzzle/casa2Elemente/perete-exterior-stanga.svg",
                "partName": "outer left wall mobile",
                "glb": "/models/house_puzzle/8.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 33,
                "step": 8,
                svg: "/puzzle/casa2Elemente/perete-exterior-fata.svg",
                "partName": "outer front wall mobile",
                "glb": "/models/house_puzzle/11.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 34,
                "step": 9,
                svg: "/puzzle/casa2Elemente/fatada-casa.svg",
                "partName": "fronter part mobile",
                "glb": "/models/house_puzzle/12.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 35,
                "step": 10,
                svg: "/puzzle/casa2Elemente/acoperis-fata.svg",
                "partName": "front roof mobile",
                "glb": "/models/house_puzzle/15.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 36,
                "step": 11,
                svg: "/puzzle/casa2Elemente/acoperis-spate.svg",
                "partName": "back roof mobile",
                "glb": "/models/house_puzzle/16.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 37,
                "step": 12,
                svg: "/puzzle/casa2Elemente/acoperis-dreapta.svg",
                "partName": "right roof mobile",
                "glb": "/models/house_puzzle/17.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                }, placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 38,
                "step": 13,
                svg: "/puzzle/casa2Elemente/acoperis-stanga.svg",
                "partName": "left roof mobile",
                "glb": "/models/house_puzzle/18.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 39,
                "step": 14,
                svg: "/puzzle/casa2Elemente/acoperis-frontal-dreapta.svg",
                "partName": "front right decoration roof mobile",
                "glb": "/models/house_puzzle/19.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 40,
                "step": 15,
                svg: "/puzzle/casa2Elemente/acoperis-frontal-stanga.svg",
                "partName": "front left decoration roof mobile",
                "glb": "/models/house_puzzle/20.glb",
                "position": [0, 0.877, -3.389],
                scale: [1, 1, 1],
                "rotation": [0, 0, 0],
                "isMobile": true,
                "bounds": {
                    "max": [4.9, 1.2, 1.1],
                    "min": [-4.9, -1.2, -1.1]
                },
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            }
        ],
        steps: [
            {
                stepNumber: 1,
                description: "Pune fundatia casei pe masa"
            },
            {
                stepNumber: 2,
                description: "Fixeaza peretele din spate si cel din fata"
            },
            {
                stepNumber: 3,
                description: "Fixeaza peretii laterali ai casei"
            },
            {
                stepNumber: 4,
                description: "Pune tavanul"
            },
            {
                stepNumber: 5,
                description: "Fixeaza 2 porti in fata casei in punctele plasate pe graficul 3D"
            },
            {
                stepNumber: 6,
                description: "Fixeaza ultimele 2 porti in partiele laterale a casei in punctele indicate in grafic"
            },
            {
                stepNumber: 7,
                description: "Fixeaza peretii laterali exteriori in punctele indicate"
            },
            {
                stepNumber: 8,
                description: "Instaleaza peretele exterior din fata in punctele frontale ramase"
            },
            {
                stepNumber: 9,
                description: "Pune peretele frontal al casei"
            },
            {
                stepNumber: 10,
                description: "Pune piesa acoperis din fata"
            },
            {
                stepNumber: 11,
                description: "Pune piesa acoperis din dreapta"
            },
            {
                stepNumber: 12,
                description: "Pune piesa acoperis din spate"
            },
            {
                stepNumber: 13,
                description: "Pune piesa acoperis din stanga"
            },
            {
                stepNumber: 14,
                description: "Pune piesa frontala a acoperisului din partea stanga"
            },
            {
                stepNumber: 15,
                description: "Pune piesa frontala a acoperisului din partea dreapta"
            }
        ]
    }
]
