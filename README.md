# Vardagsfix

En fullstack-applikation för bokning av vardagstjänster, utvecklad som examensarbete.

## Tekniker

- **Backend:** Java, Spring Boot, Spring Security, PostgreSQL, JWT
- **Frontend:** React, TypeScript, Vite
- **Testning:** JUnit 5, Mockito, Vitest, React Testing Library

## Förutsättningar

- Java 21
- Node.js
- Docker Desktop

## Installation och start

### 1. Klona repot
```bash
git clone https://github.com/ceciliachris/VardagsFix.git
cd VardagsFix
```

### 2. Starta databasen
Starta Docker Desktop och kör:
```bash
docker run --name vardagsfix-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vardagsfix \
  -p 5432:5432 \
  -d postgres
```

### 3. Konfigurera miljövariabel
Sätt miljövariabeln `JWT_SECRET` i din IDE (t.ex. IntelliJ under Edit Configurations → Environment variables):
JWT_SECRET=din-hemliga-nyckel

### 4. Starta backend
Kör `VardagsfixApplication` via IntelliJ, eller via terminalen om miljövariabeln är satt:
```bash
cd backend
./gradlew bootRun
```
Backend körs på `http://localhost:8080`

### 5. Starta frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend körs på `http://localhost:5174`

## Tester

### Backend
```bash
cd backend
./gradlew test
```

### Frontend
```bash
cd frontend
npm run test
```

## API-dokumentation
Starta backend och öppna:
`http://localhost:8080/swagger-ui/index.html`
