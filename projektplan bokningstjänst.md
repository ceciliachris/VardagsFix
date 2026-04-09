# Projektplan för Examensarbete

**Ditt namn:** Cecilia Christiansson\
**Din handledare:** William Enander

## 1. Projektöversikt

### 1.1 Projekttitel

_Utveckling av en fullstack-baserad bokningsplattform för vardagstjänster_

### 1.2 Projekttyp

- [X] Utvecklingsprojekt (bygga en applikation/system)\
- [ ] Forskningsprojekt (undersöka och analysera ett ämne)\
- [ ] Hybridprojekt (kombinerar utveckling med forskning)

### 1.3 Sammanfattning (max 200 ord)

_Detta projekt syftar till att utveckla en fullstack-applikation i form av en bokningsplattform för vardagstjänster. Plattformen ska möjliggöra för användare att registrera sig, logga in, skapa och publicera egna tjänster samt boka tjänster som erbjuds av andra användare. Exempel på tjänster inkluderar gräsklippning, hundpromenader och enklare hushållsrelaterade uppdrag.
I dagsläget förmedlas många enklare tjänster informellt, exempelvis genom inlägg i Facebookgrupper där privatpersoner erbjuder eller efterfrågar hjälp. Samtidigt finns det etablerade bokningsplattformar, men dessa är ofta nischade mot specifika områden såsom skönhetstjänster eller djurpassning. Det saknas därmed en mer generell och strukturerad lösning för att hantera denna typ av vardagstjänster.
Applikationen kommer att bestå av en backend utvecklad i Java med Spring Boot, ett REST API för kommunikation samt en databas för lagring av användare, tjänster och bokningar. En frontend kommer att utvecklas för att ge användaren ett intuitivt gränssnitt för att hantera tjänster och bokningar
Projektet fokuserar på att implementera säker autentisering, korrekt bokningslogik och en tydlig systemarkitektur. Målet är att skapa en fungerande och strukturerad applikation som demonstrerar centrala koncept inom fullstack-utveckling, inklusive API-design, databasstruktur och användarhantering._

## 2. Bakgrund och Problemformulering

### 2.1 Bakgrund

_Digitala plattformar för att boka tjänster har blivit allt vanligare och används inom flera områden, exempelvis skönhet, träning och djurpassning. Dessa tjänster gör det enklare för användare att hitta och boka olika typer av taskService på ett strukturerat sätt.
Samtidigt sker en stor del av enklare vardagstjänster fortfarande informellt, till exempel genom inlägg i Facebookgrupper där privatpersoner erbjuder eller efterfrågar hjälp med uppgifter som gräsklippning, hundpromenader eller bortforsling av skräp. Dessa lösningar saknar ofta struktur, sökbarhet och säker hantering av bokningar.
Det finns därmed ett intresse i att undersöka hur en mer generell digital plattform kan utformas för att samla olika typer av vardagstjänster på ett och samma ställe, samt hur funktioner som användarhantering, bokningssystem och datalagring kan implementeras på ett effektivt sätt._

### 2.2 Problemformulering

_Hur kan bokningslogik och autentisering implementeras i en fullstack-baserad webbapplikation för att säkerställa giltiga och säkra bokningar av tjänster?_

**Delfrågor**
_Hur kan JWT-baserad autentisering och auktorisering implementeras i en Spring Boot-applikation för att skydda bokningsrelaterade resurser?_
_Hur kan bokningslogik utformas för att förhindra dubbelbokningar och hantera samtidiga bokningsförfrågningar?_
_Hur kan ett REST API designas för att hantera relationen mellan användare, tjänster och bokningar på ett strukturerat sätt?_
_Hur kan bokningslogik testas och valideras för att säkerställa korrekt funktion?_

### 2.3 Syfte och Mål

**Syfte:** _Syftet med projektet är att utveckla en fullstack-applikation som möjliggör för användare att både erbjuda och boka vardagstjänster, samt att undersöka hur centrala delar som autentisering, bokningslogik och systemarkitektur kan implementeras på ett strukturerat och säkert sätt._

**Specifika mål:**

- _Mål 1: Utveckla en fungerande webbapplikation med frontend och backend_
- _Mål 2: Implementera ett REST API för hantering av användare, tjänster och bokningar_
- _Mål 3: Implementera säker autentisering och behörighetshantering_
- _Mål 4: Skapa en databasstruktur som hanterar relationer mellan användare, tjänster och bokningar_
- _Mål 5: Implementera och testa bokningslogik för att säkerställa giltiga bokningar_

### 2.4 Avgränsningar

_Projektet kommer att fokusera på kärnfunktionalitet för bokning och hantering av tjänster. Avancerade funktioner såsom betalningsintegration, realtidskommunikation och notifikationer kommer inte att implementeras. Applikationen kommer inte heller att optimeras för produktion i stor skala utan fokus ligger på funktionalitet, struktur och teknisk implementation._

## 3. Teknisk Specifikation (för utvecklingsprojekt)

### 3.1 Teknisk Stack

- **Frontend:** _React_
- **Backend:** _Java med Spring Boot_
- **Databas:** _PostgreSQL (via Docker)_
- **Övrigt:** _REST API för kommunikation mellan frontend och backend, JWT för autentisering (Eventuellt OAuth2 som komplement), Git för versionshantering, JUnit för enhetstestning._

### 3.2 Funktionella Krav

- _Användare ska kunna registrera konto_
- _Användare ska kunna logga in och logga ut_
- _Användare ska kunna skapa, uppdatera och ta bort egna tjänster_
- _Användare ska kunna se en lista över tillgängliga tjänster_
- _Användare ska kunna boka en tjänst_
- _Användare ska kunna avboka en bokning_
- _Användare ska kunna se sina egna bokningar_
- _Användare ska inte kunna boka sin egen tjänst_
- _Systemet ska förhindra bokningar som krockar i tid_
- _Användaren ska kunna skicka meddelanden till den som erbjuder en tjänst_
- _Användaren ska kunna skicka meddelanden till den som bokat en tjänst_

### 3.3 Icke-funktionella Krav

- **Prestanda:** _Applikationen ska kunna hantera flera samtidiga användare med rimliga svarstider._
- **Säkerhet:** _Systemet ska använda autentisering med JWT för att skydda användardata och begränsa åtkomst till skyddade resurser._
- **Användbarhet:** _Frontend ska vara enkel och intuitiv att använda, med tydlig navigering och responsiv design._

## 4. Metod och Genomförande

### 4.1 Utvecklingsmetod

_Projektet kommer att genomföras med en iterativ utvecklingsmetod. Det innebär att funktionalitet utvecklas stegvis i mindre delar, där varje del testas och förbättras innan nästa steg påbörjas. Detta möjliggör kontinuerlig utvärdering och anpassning under projektets gång._

### 4.2 Arbetsprocess

1. **Fas 1: Kravanalys och design**  
   Identifiera funktionella krav, designa databasstruktur samt planera API-endpoints.

2. **Fas 2: Utveckling av grundfunktioner**  
   Implementera användarhantering, autentisering (JWT) samt grundläggande API-struktur.

3. **Fas 3: Implementation av avancerade funktioner**  
   Implementera tjänster, bokningar och affärslogik, inklusive validering och felhantering.

4. **Fas 4: Frontend**  
   Utveckla ett användargränssnitt för att hantera tjänster och bokningar samt integrera med backend via API.

5. **Fas 5: Testning och debugging**  
   Genomföra enhetstester och manuell testning för att säkerställa funktionalitet och stabilitet.

6. **Fas 6: Dokumentation och slutrapport**  
   Dokumentera projektet, reflektera över resultatet och sammanställa examensrapporten.

### 4.3 Verktyg och Resurser

- **Utvecklingsverktyg:** _IntelliJ IDEA, GitHub för versionshantering samt Swagger/OpenAPI för dokumentation och testning av API-endpoints_
- **Testverktyg:** _JUnit för enhetstestning samt manuell testning av API via Swagger_
- **Projekthantering:** _(GitHub Projects)_
- **Externa resurser:** _(Dokumentation för Spring Boot, PostgreSQL och React, samt användning av AI-baserade verktyg för stöd i problemlösning och utveckling)_

## 5. Tidsplan

### 5.1 Milstolpar

| Vecka | Milstolpe                       | Leverabler                                                    |
|-------|---------------------------------|---------------------------------------------------------------|
| 1     | _Kravanalys och design_         | _Kravspecifikation, databasmodell, API-design_                |
| 1-2   | _Backend grundfunktioner_       | _Användarhantering, autentisering (JWT)_                      |
| 2-3   | _Backend bokningssystem_        | _Tjänster, bokningar, affärslogik_                            |
| 3-4   | _Frontend utveckling_           | _UI för tjänster och bokningar, API-integration_              |
| 4-5   | _Testning och förbättringar_    | _Tester, buggfixar, förbättrad funktionalitet, dokumentation_ |
| 5     | _Slutförande och dokumentation_ | _Färdig applikation, rapport och presentation_                |

### 5.2 Tidsallokering

- **Timmar per vecka:** _35-40 timmar_
- **Total beräknad arbetstid:** _180-200 timmar_

## 6. Riskanalys

| Risk                                              | Sannolikhet | Påverkan | Åtgärd                                                                    |
|---------------------------------------------------|-------------|----------|---------------------------------------------------------------------------|
| _Tekniska problem med autentisering (JWT/OAuth2)_ | _Medel_     | _Hög_    | _Fokusera på JWT som grund och implementera OAuth2 endast om tid finns_   |
| _Tidsbrist_                                       | _Hög_       | _Hög_    | _Prioritera kärnfunktionalitet och skala bort icke-nödvändiga funktioner_ |
| _Problem med databasdesign_                       | _Medel_     | _Medel_  | _Planera databasstruktur tidigt och testa med enklare data_               |
| _Svårigheter med frontend-integration_            | _Medel_     | _Medel_  | _Utveckla och testa API med Swagger innan frontend kopplas_               |
| _Buggar i bokningslogik_                          | _Medel_     | _Hög_    | _Implementera tester och validering för att säkerställa korrekt funktion_ |

## 7. Utvärdering och Testning

### 7.1 Testplan

- **Enhetstestning:** _Enhetstester kommer att implementeras med JUnit för att testa centrala delar av backend-logiken, exempelvis bokningslogik och validering._
- **Integrationstestning:** _API-endpoints kommer att testas för att säkerställa att olika delar av systemet fungerar tillsammans, inklusive kommunikation mellan backend och databas._
- **Användartestning:** _Applikationen kommer att testas manuellt via frontend samt genom verktyg som Swagger för att verifiera att funktionalitet och användarflöden fungerar som förväntat._

### 7.2 Framgångskriterier

- _Kriterium 1: Applikationen ska möjliggöra att användare kan registrera sig, logga in och hantera sina konton_
- _Kriterium 2: Användare ska kunna skapa och boka tjänster utan fel_
- _Kriterium 3: Bokningslogik ska fungera korrekt och förhindra ogiltiga bokningar_
- _Kriterium 4: API:et ska fungera stabilt och kunna testas via Swagger_
- _Kriterium 5: Minst grundläggande tester ska vara implementerade och godkända_
- _Kriterium 6: Applikationen ska ha en fungerande frontend kopplad till backend_
- _Kriterium 7: Felhantering ska ge tydliga felmeddelanden_

## 8. Referenser och Källor

- Dokumentation för Spring Boot (spring.io)
- Dokumentation för Spring Security och JWT
- Dokumentation för PostgreSQL
- Dokumentation för React
- Dokumentation för Swagger/OpenAPI
- Kursmaterial och föreläsningar
- Online-resurser såsom tutorials och utvecklarforum (t.ex. Stack Overflow)
- AI-baserade verktyg som stöd i utvecklingsprocessen
