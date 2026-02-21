# Gase Inventory Mobile (React Native)

Bu klasör, mevcut `gase-inventory-web` projesinin API katmanını temel alarak hazırlanmış Expo tabanlı bir React Native başlangıç uygulamasıdır.

## Kapsam
- Token tabanlı giriş (`/auth/login`)
- Sekmeli ana yapı (Ana Sayfa / Ürünler / Stok)
- Ürün listesi (`/products`)
- Stok özeti (`/inventory/stock/summary`)

## Çalıştırma
```bash
cd react-native-app
npm install
npm run start
```

## Environment
`EXPO_PUBLIC_API_BASE_URL` ile API adresini ayarlayın:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080 npm run start
```

## Yeni repoya taşıma
Mevcut web reposunu bozmadan yeni repo oluşturmak için:

```bash
# proje kökünde
mkdir -p ../gase-inventory-mobile
rsync -av --exclude node_modules react-native-app/ ../gase-inventory-mobile/
cd ../gase-inventory-mobile
git init
git add .
git commit -m "feat: initialize React Native mobile app"
git remote add origin <NEW_REPO_URL>
git push -u origin main
```

> Not: Bu adım için sizin Git erişim bilgileriniz gerekir.

## Otomatik export script'i (web repo içinden)
Kök repoda aşağıdaki script eklendi:

```bash
./scripts/publish-mobile.sh
```

Opsiyonel:

```bash
./scripts/publish-mobile.sh <TARGET_DIR> <REMOTE_URL>
```
