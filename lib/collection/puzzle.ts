import { Vector3 } from "three"

export interface PuzzlePiece {
    _id: number
    step: number,
    partName: string,
    glb: string,
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
                "partName": "fundatie",
                "glb": "/models/house_puzzle/1.glb",
                svg: "/puzzle/casa2Elemente/podea.svg",
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 1, 0)
                }
            },
            {
                _id: 2,
                "step": 2,
                "partName": "perete spate",
                "glb": "/models/house_puzzle/3.glb",

                svg: "/puzzle/casa2Elemente/perete-spate.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 3,
                "step": 2,
                "partName": "perete fata",
                "glb": "/models/house_puzzle/2.glb",

                svg: "/puzzle/casa2Elemente/perete-fata.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 4,
                "step": 3,
                "partName": "perete dreapta",
                "glb": "/models/house_puzzle/5.glb",

                svg: "/puzzle/casa2Elemente/perete-dreapta.svg",


                placementDir: {
                    start: new Vector3(0, 0, 6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 5,
                "step": 3,
                "partName": "perete stanga",
                "glb": "/models/house_puzzle/4.glb",

                svg: "/puzzle/casa2Elemente/perete-stanga.svg",

                placementDir: {
                    start: new Vector3(0, 0, -6),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 6,
                "step": 4,
                "partName": "portita dreapta exterior",
                "glb": "/models/house_puzzle/9.glb",

                svg: "/puzzle/casa2Elemente/portita-dreapta-extrem.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 7,
                "step": 4,
                "partName": "portita stanga exterior",
                "glb": "/models/house_puzzle/10.glb",

                svg: "/puzzle/casa2Elemente/portita-stanga-extrem.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 8,
                "step": 5,
                "partName": "perete exterior dreapta",
                "glb": "/models/house_puzzle/7.glb",

                svg: "/puzzle/casa2Elemente/perete-exterior-dreapta.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 9,
                "step": 5,
                "partName": "perete exterior stanga",
                "glb": "/models/house_puzzle/8.glb",

                svg: "/puzzle/casa2Elemente/perete-exterior-stanga.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 10,
                "step": 6,
                "partName": "perete exterior fata",
                "glb": "/models/house_puzzle/11.glb",
                svg: "/puzzle/casa2Elemente/perete-exterior-fata.svg",
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 11,
                "step": 7,
                "partName": "portita stanga",
                "glb": "/models/house_puzzle/13.glb",
                svg: "/puzzle/casa2Elemente/portita-stanga.svg",
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 12,
                "step": 7,
                "partName": "portita dreapta",
                "glb": "/models/house_puzzle/14.glb",
                svg: "/puzzle/casa2Elemente/portita-dreapta.svg",
                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 13,
                "step": 8,
                "partName": "fatada",
                "glb": "/models/house_puzzle/12.glb",
                svg: "/puzzle/casa2Elemente/fatada-casa.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 14,
                "step": 9,
                "partName": "tavan",
                "glb": "/models/house_puzzle/6.glb",

                svg: "/puzzle/casa2Elemente/tavan.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 15,
                "step": 10,
                "partName": "schela acoperis orizontala",
                "glb": "/models/house_puzzle/6.glb",

                svg: "/puzzle/casa2Elemente/schela-acoperis-orizontala.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 16,
                "step": 11,
                "partName": "schela acoperis verticala",
                "glb": "/models/house_puzzle/6.glb",

                svg: "/puzzle/casa2Elemente/schela-acoperis-verticala.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 17,
                "step": 12,
                "partName": "acoperis frontal",
                "glb": "/models/house_puzzle/15.glb",
                svg: "/puzzle/casa2Elemente/acoperis-fata.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 18,
                "step": 13,
                "partName": "acoperis spate",
                "glb": "/models/house_puzzle/17.glb",
                svg: "/puzzle/casa2Elemente/acoperis-spate.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 19,
                "step": 14,
                "partName": "acoperis dreapta",
                "glb": "/models/house_puzzle/16.glb",
                svg: "/puzzle/casa2Elemente/acoperis-dreapta.svg",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 20,
                "step": 15,
                "partName": "acoperis stanga",
                "glb": "/models/house_puzzle/18.glb",
                svg: "/puzzle/casa2Elemente/acoperis-stanga.svg",


                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 21,
                "step": 16,
                "partName": "acoperis frontal dreapta",
                svg: "/puzzle/casa2Elemente/acoperis-frontal-dreapta.svg",
                "glb": "/models/house_puzzle/19.glb",

                placementDir: {
                    start: new Vector3(0, 6, 0),
                    end: new Vector3(0, 0, 0)
                }
            },
            {
                _id: 22,
                "step": 17,
                "partName": "acoperis frontal stanga",
                svg: "/puzzle/casa2Elemente/acoperis-frontal-stanga.svg",
                "glb": "/models/house_puzzle/20.glb",

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
                description: "Fixeaza 2 porti in partile laterale a casei in punctele indicate in grafic"
            },
            {
                stepNumber: 5,
                description: "Fixeaza peretii laterali exteriori in punctele indicate"
            },
            {
                stepNumber: 6,
                description: "Instaleaza peretele exterior din fata in punctele indicate"
            },
            {
                stepNumber: 7,
                description: "Fixeaza 2 porti in fata casei in punctele plasate pe graficul 3D"
            },

            {
                stepNumber: 8,
                description: "Pune peretele frontal al casei"
            },

            {
                stepNumber: 9,
                description: "Pune tavanul"
            },
            {
                stepNumber: 10,
                description: "Pune schela orizontala a acoperisului"
            },
            {
                stepNumber: 11,
                description: "Pune schela verticala a acoperisului deasupra celei orizontale"
            },
            {
                stepNumber: 12,
                description: "Pune piesa acoperis din fata"
            },

            {
                stepNumber: 13,
                description: "Pune piesa acoperis din spate"
            },
            {
                stepNumber: 14,
                description: "Pune piesa acoperis din dreapta"
            },
            {
                stepNumber: 15,
                description: "Pune piesa acoperis din stanga"
            },
            {
                stepNumber: 16,
                description: "Pune piesa frontala a acoperisului din partea stanga"
            },
            {
                stepNumber: 17,
                description: "Pune piesa frontala a acoperisului din partea dreapta"
            }
        ]
    }
]
