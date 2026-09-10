# Ramverk för showroom-utskick

Målet nu: bygga strukturen för att skicka mejl om showroom-förfrågningar – först som test till dig själv, sedan skarpt till kunder som TH Trading. Ingen text skickas till någon kund innan du godkänt.

## 1. Avsändardomän

Sätt upp bilgen.se som avsändardomän så mejlen kommer från showroom@bilgen.se. Det kräver att du kör igenom en kort uppsättning (jag visar knappen). Utan den kan inget skickas från ditt varumärke.

## 2. Showroom-förfrågningar sparas i appen

Idag går showroom-formulären bara vidare till ditt externa flöde – inget sparas i appen, så det finns inget att skicka mejl utifrån.

- Ny tabell som sparar varje förfrågan: företag, kontaktperson, e-post, telefon, vald mall, tidpunkt, status (ny / testad / skickad).
- Formulären fortsätter skicka som idag, men sparar även i appen.
- Äldre förfrågningar som TH Trading kan läggas in manuellt av dig via ett litet formulär i ägarvyn.

## 3. Ägarvy: Showroom-förfrågningar

Ett nytt kort i ägar-dashboarden som listar alla förfrågningar. För varje rad:

- Se uppgifterna och status.
- Knapp "Skicka test till mig" – skickar exakt samma mejl till mahad@datavoxx.se.
- Knapp "Skicka till kund" – låst tills ett test har skickats, med en bekräftelseruta först.

## 4. Mejlmallen

En mall för showroom-svar med plats för företagsnamn, kontaktperson och vald mall. Innehållstexten lämnar vi tom/neutral tills du bestämt vad som ska stå – du säger till när du vill skriva den, och då fyller jag i den.

## Tekniska detaljer

- Domänuppsättning + e-postinfrastruktur (kö, sändlogg, avregistrering) via Lovable Cloud.
- Ny tabell `showroom_requests` med RLS: bara owner/admin läser; insert från formulären.
- Mall som React Email-komponent, utskick via den delade send-funktionen med idempotensnyckel per förfrågan.
- Sändlogg gör att du kan se vad som gått iväg och till vem.

## Ordning

1. Domänen sätts upp (kräver din åtgärd)
2. Tabell + sparning från formulären
3. Ägarvy med listan och test-/skickaknappar
4. Mall, testutskick till dig, godkännande, sedan skarpt till TH Trading
