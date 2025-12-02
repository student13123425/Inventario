# Admin Analytics & System Hub

## Prezentare generală

Admin Hub este o interfață de business intelligence specializată pentru administratori de sistem. Oferă o vedere centralizată a arhitecturii multi-tenant, agregând date din bazele de date ale fiecărui utilizator într-un tablou de bord unificat. Gestionează monitorizarea stării sistemului, tendințele de venit agregate și urmărirea performanței tenant-urilor.

## Stack tehnologic

### Frontend

* **React** - Componente funcționale cu Hooks
* **CSS personalizat** - Sistem de design bazat pe variabile, fără framework-uri UI externe
* **Grafice SVG** - Motor de charting personal, fără dependențe
* **Fetch API** - Recuperare asincronă nativă de date

### Backend

* **Express.js** - Ruting API și servire fișiere statice
* **SQLite3** - Arhitectură multi-bază de date (un fișier DB per tenant)
* **Node.js FS** - Operațiuni pe sistemul de fișiere pentru persistența JSON
* **Cron/Intervals** - Agregare automată a datelor în fundal

## Structura frontend-ului

### Ierarhia componentelor

```
App (Hub Wrapper)
├── Sidebar Navigation
└── Main Content Area
    ├── Topbar (Context Header)
    ├── DashboardView (Default)
    │   ├── MetricCards (Key KPI)
    │   ├── SimpleTrendChart (SVG Visualization)
    │   └── ShopTable (Tenancy Data)
    ├── SystemStatusView
    │   ├── Service Status Table
    │   └── Server Logs
    └── ReportsView
        └── Empty State Container
```

### Componente cheie

#### App (Controller)

* **Scop**: Acționează ca scheletul layout-ului și router.
* **Stare**: `currentView` ('dashboard' | 'status' | 'reports').
* **Responsabilitate**: Obține `StatisticsSummary` la mount și îl distribuie componentelor copil.

#### DashboardView

* **Scop**: Suprafața principală de vizualizare.
* **Funcționalități**:

  * Agregă metri­ci (Inventar total, Vânzări zilnice).
  * Redă graficul de tip area SVG pentru tendințele de venit pe 30 de zile.
  * Afișează un tabel cu defalcarea performanței fiecărui magazin (shop).

#### SystemStatusView

* **Scop**: Monitorizarea sănătății infrastructurii.
* **Funcționalități**: Afișare hardcodata a uptime-ului serverelor, latenței API și stării conexiunii la bază de date, împreună cu jurnale de server simulate.

#### ReportsView

* **Scop**: Managementul exportului de fișiere.
* **Stare**: Implementat în prezent cu un „empty state” grafic pentru situațiile în care nu există date (No Reports Generated).

## Motorul de agregare a datelor

### 1. Procesul de colectare a datelor (Backend)

```
Trigger (Timer/Manual) → Iterate Users → Connect User DB → Aggregate → Save JSON
```

1. **Trigger**: Sistemul inițiază prin `startStatsCollection` (la fiecare 6 ore) sau prin apel manual al API-ului.
2. **Iterare utilizatori**: Preia lista tuturor utilizatorilor înregistrați și hash-urile folderelor lor.
3. **Agregare profundă**: Pentru fiecare utilizator, sistemul:

   * Se conectează la fișierul SQLite specific utilizatorului.
   * Rulează interogări complexe (tendințe vânzări, marjă de profit, evaluare inventar) prin `getUserAnalytics`.
4. **Serializare**: Compilează toate datele utilizatorilor într-un obiect `StatisticsSummary`.
5. **Persistență**: Scrie sumarul în `stats.json` pe sistemul de fișiere al serverului.

### 2. Procesul de consum al datelor (Frontend)

```
User Load → API Call → Read JSON → Render
```

1. **Cerere client**: Frontend apelează `GET /api/public/stats`.
2. **Răspuns server**: Serverul citește și returnează conținutul brut din `stats.json`.
3. **Hydration**: Starea React mapează JSON-ul brut la interfața `StatisticsSummary`.
4. **Vizualizare**: Datele sunt trimise către componentele `SimpleTrendChart` și `MetricCard` pentru randare.

## Arhitectura API-ului backend

### Endpoint-uri pentru statistici

#### `GET /api/public/stats`

* **Scop**: Endpoint accesibil public pentru dashboard.
* **Comportament**: Citește din fișierul cache `stats.json` pentru a asigura răspunsuri cu latență scăzută, fără a interoga bazele de date ale utilizatorilor în timp real.
* **Răspuns**: Obiect `StatisticsSummary` care conține timestamp și un array cu analizele utilizatorilor.

#### `POST /api/public/stats/collect`

* **Scop**: Trigger manual pentru a forța un ciclu proaspăt de agregare a datelor.
* **Proces**: Rulează imediat rutina `saveAllStatistics`.
* **Utilizare**: Folosit de administratori pentru a vedea date actualizate imediat.

#### `GET /api/public/server-info`

* **Scop**: Endpoint de diagnostic.
* **Răspuns**: Versiunea serverului, detalii despre uptime și starea fișierului `stats.json` în sistemul de fișiere.

## Implementarea sistemului de design

### Identitate vizuală ("Inventrio Analytics")

* **Paletă de culori**:

  * **Analytics Navy** (`#1e40af`): Navigare principală și header-e.
  * **Data Purple** (`#7c3aed`): Vizualizări grafice și metrici cheie.
  * **Admin Teal** (`#0d9488`): Indicatoare de stare și sănătate sistem.
* **Tipografie**: `IBM Plex Sans` pentru text UI și `JetBrains Mono` pentru date/metrici.

### Layout & UX

* **Sistem de grid**: Grid CSS cu 12 coloane (`.dashboard-grid`) pentru layout responsive al cardurilor.
* **Gestionare scrollbar**: Reguli CSS globale care ascund barele de defilare (`scrollbar-width: none`) păstrând funcționalitatea de scroll pentru un aspect curat, asemănător aplicațiilor.
* **Feedback**: Skeleton-uri de încărcare și alerte de eroare (fundal/text roșu) pentru eșecuri la conexiunea API.

## Gestionarea stării

### Fluxul stării pentru view

Aplicația folosește un model plat de stare pentru managementul view-urilor, în locul unui router complex:

1. Utilizatorul face click pe elementul Sidebar → `setCurrentView('status')`
2. Componenta se re-randează → logică condițională `{currentView === 'status' && <SystemStatusView />}`
3. Topbar actualizează titlul contextual dinamic.

### Structuri de date

Frontend-ul respectă strict interfețele partajate cu backend-ul:

* `OverallAnalytics`: Definește forma datelor pentru analiza unui singur tenant.
* `StatisticsSummary`: Definește structura payload-ului agregat.

## Gestionarea erorilor

### Strategie backend

* **Erori sistem de fișiere**: Dacă `stats.json` lipsește, API-ul returnează o structură goală implicită cu un mesaj specific, prevenind prăbușirea frontend-ului.
* **Eșecuri DB utilizator**: Dacă baza de date a unui utilizator este coruptă, bucla de agregare loghează eroarea, dar continuă procesarea celorlalți utilizatori pentru a asigura disponibilitatea parțială a datelor.

### Strategie frontend

* **Eșec conexiune**: Afișează un banner de eroare vizual dacă cererea fetch eșuează.
* **Empty states**: Dacă graficele nu au date, afișează un placeholder specific „No Data”. Dacă nu există rapoarte, se afișează un UI specific pentru „No Reports”.
