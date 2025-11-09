# Magazin Online 3D - Aplicație Demo

O aplicație demo de magazin online construită cu Next.js, Three.js, React Three Fiber și Konva, care permite personalizarea interactivă a obiectelor 3D.

## 📋 Descriere

Această aplicație demonstrează un flux complet de e-commerce cu editare 3D, permițând utilizatorilor să:
- Vizualizeze produse 3D în timp real
- Personalizeze obiecte 3D prin adăugarea de text și imagini
- Modifice fundalul (culoare sau textură)
- Exporte modelele personalizate în format GLB
- Adauge produsele personalizate în coș

## 🚀 Tehnologii Utilizate

- **Next.js** - Framework React pentru producție
- **Three.js** - Bibliotecă JavaScript pentru grafică 3D
- **React Three Fiber** - Renderer React pentru Three.js
- **Konva** - Bibliotecă pentru canvas 2D și editare grafică
- **React Three Drei** - Utilități pentru React Three Fiber

## ✨ Funcționalități Principale

### 1. Vizualizare 3D Interactivă
- Rotire, zoom și pan pentru explorarea produselor
- Iluminare realistă și umbre
- Animații fluide și responsive

### 2. Editor de Personalizare
- **Adăugare Text**
  - Font personalizabil
  - Culoare, dimensiune și poziționare
  - Transformări (rotație, scalare)
  
- **Adăugare Imagini**
  - Upload imagini personale
  - Redimensionare și poziționare
  - Aplicare pe suprafețe 3D

- **Modificare Fundal**
  - Selectare culoare solidă
  - Upload textură personalizată
  - Preview în timp real

### 3. Export GLB
- Exportă modelul 3D personalizat
- Format GLB universal (compatibil cu majoritatea platformelor 3D)
- Include toate customizările (texte, imagini, materiale)

### 4. Coș de Cumpărături
- Adăugare produse personalizate
- Preview miniatură 3D în coș
- Gestionare cantități

## 🛠️ Instalare și Configurare

### Cerințe Preliminare
- Node.js 18+ 
- npm sau yarn

### Pași de Instalare

```bash
# Clonează repository-ul
git clone https://github.com/username/3d-shop-demo.git

# Navighează în director
cd 3d-shop-demo

# Instalează dependențele
npm install
# sau
yarn install

# Pornește serverul de development
npm run dev
# sau
yarn dev
```

Aplicația va fi disponibilă la `http://localhost:3000`


## 🎮 Cum se Utilizează

### 1. Explorare Catalog
- Răsfoiește produsele disponibile
- Click pe un produs pentru detalii
- Selectează "Personalizează" pentru a deschide editorul

### 2. Personalizare Produs
- **Adaugă Text**: Click pe butonul "Adaugă Text", editează conținutul, poziția și stilul
- **Adaugă Imagine**: Click pe "Upload Imagine", selectează fișier, poziționează pe model
- **Modifică Fundal**: Selectează culoare din picker sau upload textură personalizată
- Folosește controalele mouse pentru a roti și examina modelul

### 3. Export și Salvare
- Click pe "Export GLB" pentru a descărca modelul personalizat
- Fișierul GLB poate fi folosit în alte aplicații 3D
- Click pe "Adaugă în Coș" pentru a salva configurația

### 4. Finalizare Comandă
- Accesează coșul din icon-ul de sus
- Revizuiește produsele personalizate
- Modifică cantitățile sau șterge items
- Procedează la checkout

## 🔧 Configurare Avansată

### Adăugare Modele Noi
Plasează fișierele GLB/GLTF în `/public/models/` și actualizează catalogul în `app/page.tsx`:
Creeaza in components/models o noua componenta folosind: 
`npx gltfjsx public/models/cofee.glb -o components/models/Cofee.tsx -r public --types` 
si referentiaza in lib/utils/modelsMapper.ts 

```typescript
const products = [
  {
    id: 1,
    name: "Produs Nou",
    modelPath: "/models/produs-nou.glb",
    price: 99.99
  }
]
```

### Customizare Texturi
Adaugă texturi noi în `/public/textures/` și referențiază-le în `Textures.ts`

## 🐛 Depanare

### Modelul nu se încarcă
- Verifică calea către fișierul GLB
- Asigură-te că fișierul este valid (testează în [glTF Viewer](https://gltf-viewer.donmccurdy.com/))

### Performanță scăzută
- Optimizează modelele 3D (reduci poligoane)
- Comprimă texturile
- Limitează numărul de lumini în scenă

### Export GLB eșuează
- Verifică consola pentru erori
- Asigură-te că toate texturile sunt încărcate complet
- Testează cu un model mai simplu

## 📄 Licență

Acest proiect este o aplicație demo pentru uz educațional și demonstrativ.

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru schimbări majore, te rugăm să deschizi mai întâi un issue pentru a discuta ce ai dori să modifici.

## 📞 Contact

Pentru întrebări sau suport, deschide un issue pe GitHub.

---
