import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KRAFTY — L'assistant des artisans qui ne rate jamais un chantier" },
      {
        name: "description",
        content:
          "KRAFTY décroche, qualifie, chiffre, facture et relance pour les artisans. Standard IA 24/7, devis à la voix, avis Google. Dès 39 €/mois.",
      },
      { property: "og:title", content: "KRAFTY — Ne rate plus jamais un chantier" },
      {
        property: "og:description",
        content:
          "L'assistant IA des artisans du bâtiment. Répond, qualifie, chiffre, facture — pendant que tu bosses.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

type Trade = {
  name: string;
  flow: [string, string][];
  badge: string;
  range: string;
  note: string;
};

const TRADES: Trade[] = [
  {
    name: "Plombier",
    flow: [
      ["c", "Bonjour, j'ai une fuite sous l'évier, ça coule encore."],
      ["k", "Avez-vous pu couper l'arrivée d'eau ?"],
      ["c", "Non, je ne trouve pas le robinet."],
      ["k", "Je vous guide. C'est un appartement ou une maison, quel étage ?"],
      ["c", "Appartement, 3e étage."],
      ["k", "Compris, c'est une urgence. Je préviens Karim et je vous cale un créneau aujourd'hui."],
    ],
    badge: "URGENCE · FUITE ACTIVE",
    range: "150 – 280 €",
    note: "RDV aujourd'hui · SMS prioritaire envoyé à l'artisan.",
  },
  {
    name: "Électricien",
    flow: [
      ["c", "Une prise a fait des étincelles ce matin."],
      ["k", "Sentez-vous une odeur de brûlé près de la prise ?"],
      ["c", "Un peu, oui."],
      ["k", "Le disjoncteur a-t-il sauté ? Votre tableau a-t-il moins de 10 ans ?"],
      ["c", "Il a sauté, et le tableau est vieux."],
      ["k", "Ne rebranchez rien. C'est une urgence sécurité, intervention prioritaire."],
    ],
    badge: "URGENCE SÉCURITÉ",
    range: "120 – 250 €",
    note: "Intervention prioritaire · consigne de sécurité donnée.",
  },
  {
    name: "Maçon",
    flow: [
      ["c", "Je voudrais faire une terrasse en béton."],
      ["k", "Quelle surface environ, en m² ?"],
      ["c", "À peu près 25 m²."],
      ["k", "Terrain plat ou en pente ? Avez-vous des photos ?"],
      ["c", "Plat, et j'ai des photos."],
      ["k", "Parfait, je propose une visite de chantier pour un devis précis."],
    ],
    badge: "DEVIS · VISITE",
    range: "80 – 130 €/m²",
    note: "Visite de chantier proposée cette semaine.",
  },
  {
    name: "Carreleur",
    flow: [
      ["c", "Je refais ma salle de bain."],
      ["k", "Quelle surface à carreler : sol, murs, ou les deux ?"],
      ["c", "Sol et murs, environ 18 m²."],
      ["k", "Vous fournissez le carrelage ? Faut-il déposer l'ancien ?"],
      ["c", "Vous fournissez, et oui il faut déposer."],
      ["k", "Très bien, je note tout et je cale un RDV métrage."],
    ],
    badge: "DEVIS · MÉTRAGE",
    range: "50 – 90 €/m² posé",
    note: "RDV métrage proposé.",
  },
  {
    name: "Paysagiste",
    flow: [
      ["c", "Mon jardin est à l'abandon, il faut tout reprendre."],
      ["k", "Quelle surface environ ? Tonte, taille, ou création complète ?"],
      ["c", "Environ 300 m², un peu de tout."],
      ["k", "Les engins peuvent-ils accéder ? Ponctuel ou entretien régulier ?"],
      ["c", "Accès facile, plutôt régulier."],
      ["k", "Idéal pour un contrat d'entretien. Je propose une visite."],
    ],
    badge: "DEVIS · ENTRETIEN",
    range: "40 – 70 €/h",
    note: "Visite proposée · option contrat régulier.",
  },
];

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCount(target: number, durMs = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durMs);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durMs]);
  return v;
}

function Index() {
  useReveal();
  const [activeTrade, setActiveTrade] = useState(0);
  const [shownMsgs, setShownMsgs] = useState(0);
  const [showEst, setShowEst] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShownMsgs(0);
    setShowEst(false);
    const trade = TRADES[activeTrade];
    trade.flow.forEach((_, i) => {
      setTimeout(() => setShownMsgs(i + 1), i * 450);
    });
    timerRef.current = setTimeout(
      () => setShowEst(true),
      trade.flow.length * 450 + 250
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeTrade]);

  // ROI calc state
  const [missed, setMissed] = useState(8); // appels manqués / semaine
  const [avg, setAvg] = useState(320); // panier moyen €
  const [conv, setConv] = useState(35); // % conversion appel → chantier
  const lostMonth = useMemo(
    () => Math.round(missed * 4.3 * (conv / 100) * avg),
    [missed, avg, conv]
  );
  const recovered = Math.round(lostMonth * 0.7);

  // animated tickers
  const callsCount = useCount(12847);
  const quotesCount = useCount(3219);
  const cashCount = useCount(184000);

  const trade = TRADES[activeTrade];

  return (
    <>
      <header className="k-header">
        <div className="wrap navbar">
          <a className="logo" href="#top">
            KRAFTY<b>.</b>
          </a>
          <nav className="links">
            <a href="#solution">La solution</a>
            <a href="#demo">Démo</a>
            <a href="#roi">Calculateur</a>
            <a href="#metiers">Métiers</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#contact" className="btn">
              Réserver une démo ›
            </a>
          </nav>
        </div>
      </header>

      <a id="top" />
      <section className="hero">
        <div className="wrap heroflex">
          <div>
            <span className="live reveal">
              <span className="d" />
              Disponible 24/7
            </span>
            <h1 className="reveal d1">
              Ne rate plus jamais un <span className="acc">chantier.</span>
            </h1>
            <p className="sub reveal d2">
              KRAFTY décroche ton téléphone, répond sur WhatsApp, pose les bonnes
              questions de ton métier et donne au client une fourchette de prix —
              pendant que tu travailles.
            </p>
            <div className="cta reveal d3">
              <a href="#contact" className="btn">
                Réserver une démo ›
              </a>
              <a href="#demo" className="btn ghost">
                Voir une conversation
              </a>
            </div>
            <p className="note reveal d4">
              Dès 39 €/mois · Sans engagement · Hébergé en France 🇫🇷
            </p>
          </div>
          <div className="phone">
            <div className="screen">
              <div className="call">
                <div className="who">Appel entrant — 14h12</div>
                <div className="meta">KRAFTY RÉPOND · CHANTIER EN COURS</div>
                <div className="waves" aria-hidden>
                  <span /><span /><span /><span /><span /><span /><span />
                </div>
              </div>
              <div className="bubble k" style={{ animationDelay: ".3s" }}>
                Bonjour, vous êtes bien chez Karim, plomberie-chauffage. Urgence ou
                devis ?
              </div>
              <div className="bubble c" style={{ animationDelay: "1s" }}>
                Une fuite sous l'évier, ça coule encore…
              </div>
              <div className="bubble k" style={{ animationDelay: "1.7s" }}>
                Avez-vous coupé l'arrivée d'eau ? C'est une maison ou un
                appartement ?
              </div>
              <div className="bubble c" style={{ animationDelay: "2.5s" }}>
                Appartement, 3e étage. Pas trouvé le robinet.
              </div>
              <div className="estimate2" style={{ animationDelay: "3.3s" }}>
                <div className="el">FOURCHETTE ESTIMÉE</div>
                <div className="ev">150 – 280 €</div>
                <div className="es">Urgence · RDV proposé aujourd'hui 16h30</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="row">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              Plombier Électricien Maçon Peintre Carreleur Paysagiste Couvreur
              Menuisier Serrurier Chauffagiste
            </span>
          ))}
        </div>
      </div>

      {/* PROBLEME */}
      <section className="blk dark" id="probleme">
        <div className="wrap">
          <span className="kicker reveal" style={{ color: "#FF8A5C" }}>
            Le problème
          </span>
          <h2 className="reveal d1">
            Sur un chantier,
            <br />
            personne ne décroche.
          </h2>
          <p className="lead reveal d2">
            Chaque appel raté part chez le concurrent. Le reste — devis, relances,
            paperasse — se règle le soir, à la main. Ce n'est pas un manque de
            volonté : c'est structurel.
          </p>
          <div className="grid3">
            <div className="pcard reveal d1">
              <div className="big">¼</div>
              <p>
                des appels ratés par les pros du service à domicile — et la plupart
                ne rappellent pas : ils filent chez le concurrent.
                <span className="src">Source : Invoca</span>
              </p>
            </div>
            <div className="pcard reveal d2">
              <div className="big">¾</div>
              <p>
                des entreprises gèrent encore leurs relances d'impayés à la main.
                Des soirées entières de paperasse.
                <span className="src">Source : Baromètre Payt × Ipsos, 2026</span>
              </p>
            </div>
            <div className="pcard reveal d3">
              <div className="big">¼</div>
              <p>
                des faillites sont dues aux retards de paiement. Le cash, c'est ce
                qui tue les TPE du bâtiment.
                <span className="src">Source : Banque de France</span>
              </p>
            </div>
          </div>

          {/* LIVE TICKER */}
          <div className="ticker reveal d3">
            <div className="tk">
              <div className="lab">Appels traités cette semaine</div>
              <div className="v">{callsCount.toLocaleString("fr-FR")}</div>
              <div className="s2">Réseau KRAFTY · temps réel</div>
            </div>
            <div className="tk">
              <div className="lab">Devis générés</div>
              <div className="v">{quotesCount.toLocaleString("fr-FR")}</div>
              <div className="s2">À la voix, en moins de 2 minutes</div>
            </div>
            <div className="tk">
              <div className="lab">Cash débloqué (relances)</div>
              <div className="v">{cashCount.toLocaleString("fr-FR")} €</div>
              <div className="s2">Impayés récupérés ce mois-ci</div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="blk" id="solution">
        <div className="wrap">
          <span className="kicker reveal">La solution</span>
          <h2 className="reveal d1">
            Un employé qui
            <br />
            ne dort jamais.
          </h2>
          <p className="lead reveal d2">
            KRAFTY répond à ta place, dans ta voix et le langage de ton métier.
            Trois étapes, zéro effort.
          </p>
          <div className="steps">
            <div className="stp reveal d1">
              <div className="n">01</div>
              <h3>Ça décroche</h3>
              <p>
                Téléphone et WhatsApp, 24h/24, dans ta voix. Chaque client est
                accueilli, même quand tu es en haut d'une toiture.
              </p>
            </div>
            <div className="stp reveal d2">
              <div className="n">02</div>
              <h3>Ça qualifie</h3>
              <p>
                KRAFTY pose les questions précises de ton métier, distingue
                l'urgence du devis et donne au client une fourchette de prix.
              </p>
            </div>
            <div className="stp reveal d3">
              <div className="n">03</div>
              <h3>Ça gère</h3>
              <p>
                Du devis dicté à la voix jusqu'à la facture, la relance d'impayé et
                l'avis Google. La boucle complète, en un outil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHAIN */}
      <section className="blk dark">
        <div className="wrap">
          <span className="kicker reveal" style={{ color: "#FF8A5C" }}>
            Le vrai plus
          </span>
          <h2 className="reveal d1">
            Un seul fil, du premier
            <br />
            appel jusqu'au paiement.
          </h2>
          <p className="lead reveal d2">
            Les autres font une brique. KRAFTY relie tout : le lead, le prix, le
            devis, la facture, le cash.
          </p>
          <div className="flow reveal d3">
            <div className="node">
              <div className="s">APPEL</div>
              <h4>Lead capté</h4>
              <p>Téléphone &amp; WhatsApp, 24/7.</p>
            </div>
            <div className="node">
              <div className="s">TRI</div>
              <h4>Qualifié</h4>
              <p>Questions métier + fourchette de prix.</p>
            </div>
            <div className="node">
              <div className="s">DEVIS</div>
              <h4>Chiffré</h4>
              <p>Devis dicté à la voix.</p>
            </div>
            <div className="node">
              <div className="s">FACTURE</div>
              <h4>Facturé</h4>
              <p>Prêt facture électronique.</p>
            </div>
            <div className="node">
              <div className="s">CASH</div>
              <h4>Payé</h4>
              <p>Relance auto + avis Google.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO INTERACTIVE */}
      <section className="blk" id="demo">
        <div className="wrap">
          <span className="kicker reveal">Démo · La précision KRAFTY</span>
          <h2 className="reveal d1">
            Les bonnes questions.
            <br />
            Puis un prix.
          </h2>
          <p className="lead reveal d2">
            KRAFTY ne pose pas des questions génériques. Choisis un métier et
            regarde l'échange : des questions taillées sur mesure, et une fourchette
            de prix donnée au client à la fin.
          </p>
          <div className="demo reveal d3">
            <div className="tabs">
              {TRADES.map((t, i) => (
                <button
                  key={t.name}
                  className={"tab" + (i === activeTrade ? " on" : "")}
                  onClick={() => setActiveTrade(i)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="demoflex">
              <div className="convo">
                {trade.flow.slice(0, shownMsgs).map(([who, msg], i) => (
                  <div key={i} className={"cb " + who}>
                    {msg}
                  </div>
                ))}
              </div>
              <div className={"estimate" + (showEst ? " show" : "")}>
                <div className="tagx">{trade.badge}</div>
                <div className="el">Fourchette estimée pour le client</div>
                <div className="ev">{trade.range}</div>
                <div className="es">{trade.note}</div>
              </div>
            </div>
          </div>
          <p className="disc reveal d3">
            Fourchettes indicatives, paramétrées par chaque artisan dans son tableau
            de bord · devis précis confirmé après visite ou RDV.
          </p>
        </div>
      </section>

      {/* ROI CALCULATOR — game changer */}
      <section className="blk" id="roi">
        <div className="wrap">
          <span className="kicker reveal">Calculateur · Combien tu perds</span>
          <h2 className="reveal d1">
            Mets tes vrais chiffres.
            <br />
            Regarde ce qui s'échappe.
          </h2>
          <p className="lead reveal d2">
            Trois curseurs, une réalité. Le chiffre en face, c'est ce que tes
            appels manqués coûtent chaque mois à ton entreprise.
          </p>
          <div className="roi reveal d3">
            <div className="ctrl">
              <div className="row">
                <label>Appels manqués / semaine</label>
                <div className="val">{missed}</div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={missed}
                  onChange={(e) => setMissed(+e.target.value)}
                />
              </div>
              <div className="row">
                <label>Panier moyen d'un chantier</label>
                <div className="val">{avg.toLocaleString("fr-FR")} €</div>
                <input
                  type="range"
                  min={80}
                  max={3000}
                  step={20}
                  value={avg}
                  onChange={(e) => setAvg(+e.target.value)}
                />
              </div>
              <div className="row">
                <label>Taux de conversion (appel → chantier)</label>
                <div className="val">{conv} %</div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  value={conv}
                  onChange={(e) => setConv(+e.target.value)}
                />
              </div>
            </div>
            <div className="out">
              <div className="lab">Manque à gagner estimé / mois</div>
              <div className="big">{lostMonth.toLocaleString("fr-FR")} €</div>
              <div className="sub2">
                C'est ce que tes appels ratés laissent partir chez le concurrent —
                avant même de parler de relances d'impayés.
              </div>
              <div className="gain">
                Avec KRAFTY, en moyenne <b>+{recovered.toLocaleString("fr-FR")} €/mois</b> récupérés
                (≈ 70 % des appels captés).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE — game changer */}
      <section className="blk dark">
        <div className="wrap">
          <span className="kicker reveal" style={{ color: "#FF8A5C" }}>
            Avant / Après
          </span>
          <h2 className="reveal d1">
            La vie d'un artisan,
            <br />
            avec et sans KRAFTY.
          </h2>
          <div className="cmp reveal d2">
            <div className="col bad">
              <h4>Sans KRAFTY</h4>
              <ul>
                <li>1 appel sur 4 part au concurrent</li>
                <li>Devis rédigés à 22h, après le chantier</li>
                <li>Relances d'impayés faites « quand j'ai le temps »</li>
                <li>WhatsApp qui déborde, agenda dans la tête</li>
                <li>Avis Google ? On oublie d'en demander</li>
                <li>Facture électronique 2026 : panique en vue</li>
              </ul>
            </div>
            <div className="col good">
              <h4>Avec KRAFTY</h4>
              <ul>
                <li>100 % des appels accueillis, qualifiés, planifiés</li>
                <li>Devis dictés à la voix entre deux chantiers</li>
                <li>Relances automatiques, ton cash rentre tout seul</li>
                <li>Tout dans un seul fil, classé par urgence</li>
                <li>Demande d'avis envoyée après chaque mission</li>
                <li>Prêt pour la réforme 2026/2027, sans rien faire</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIG PANEL */}
      <section className="blk dark" id="config">
        <div className="wrap">
          <span className="kicker reveal" style={{ color: "#FF8A5C" }}>
            Le moteur
          </span>
          <h2 className="reveal d1">
            Configuré pour toi,
            <br />
            au détail près.
          </h2>
          <p className="lead reveal d2">
            KRAFTY ne devine pas. Tu le paramètres une fois dans ton tableau de
            bord — il parle exactement comme ton entreprise, connaît tes urgences
            et donne des prix justes.
          </p>
          <div className="panel reveal d3">
            <div className="ph">
              <div className="t">Karim — Plomberie-chauffage</div>
              <div className="s">PARAMÉTRAGE KRAFTY</div>
            </div>
            <div className="pgrid">
              <div className="pblock">
                <div className="lab">Spécialités</div>
                <div className="tagrow">
                  <span className="ptag on">Dépannage fuite</span>
                  <span className="ptag on">Chaudière</span>
                  <span className="ptag on">Salle de bain</span>
                  <span className="ptag off">Photovoltaïque</span>
                </div>
              </div>
              <div className="pblock">
                <div className="lab">Disponibilités &amp; zone</div>
                <div className="days">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i} className={"day" + (i < 6 ? " on" : "")}>
                      {d}
                    </span>
                  ))}
                </div>
                <div className="kv">
                  <b>07h30 – 19h00</b> · Lyon + 20 km
                </div>
              </div>
              <div className="pblock">
                <div className="lab">Définition des urgences</div>
                <div className="kv">
                  Fuite active · panne de chauffage en hiver →{" "}
                  <b>SMS prioritaire immédiat</b>. Tout le reste → agenda.
                </div>
              </div>
              <div className="pblock">
                <div className="lab">Fourchettes de prix</div>
                <div className="pi">
                  <span>Dépannage fuite</span>
                  <b>150 – 280 €</b>
                </div>
                <div className="pi">
                  <span>Remplacement chaudière</span>
                  <b>2 500 – 4 500 €</b>
                </div>
                <div className="pi">
                  <span>Salle de bain complète</span>
                  <b>4 000 – 8 000 €</b>
                </div>
              </div>
            </div>
          </div>
          <p className="panelnote reveal d3">
            → C'est ce panneau qui permet à KRAFTY de répondre comme toi, de
            prioriser les vraies urgences et de donner à chaque client une
            fourchette de prix juste.
          </p>
        </div>
      </section>

      {/* FONCTIONS */}
      <section className="blk" id="fonctions">
        <div className="wrap">
          <span className="kicker reveal">Ce que ça fait</span>
          <h2 className="reveal d1">
            Tout ce qu'une bonne
            <br />
            secrétaire ferait. En mieux.
          </h2>
          <div className="feat">
            {[
              ["☎", "Standard téléphonique IA", "Répond à ta place avec ta propre voix. Le client est rassuré, jamais devant un répondeur."],
              ["✆", "Bascule WhatsApp", "Le client préfère écrire ? KRAFTY enchaîne sur WhatsApp et continue la conversation sans rien lâcher."],
              ["⚑", "Tri urgence / devis", "Une fuite le samedi soir n'est pas un devis dans trois semaines. Les urgences t'arrivent par SMS, le reste va dans l'agenda."],
              ["⚙", "Panneau de configuration", "Tes spécialités, tes jours, tes horaires, ta zone, tes urgences. Tu paramètres une fois, KRAFTY parle comme ton entreprise."],
              ["€", "Fourchette de prix immédiate", "À la fin de chaque échange, le client repart avec une estimation. Il se situe, tu ne perds plus de temps avec les touristes."],
              ["✎", "Devis & factures à la voix", "Décris le chantier, KRAFTY rédige le devis puis la facture. Prêt pour la facture électronique."],
              ["↻", "Relance des impayés", "KRAFTY relance poliment et automatiquement les factures en retard. Ton cash rentre sans que tu y penses."],
              ["★", "Avis Google automatisés", "Après chaque mission réussie, KRAFTY invite le client à laisser un avis. Plus d'avis, plus d'appels entrants."],
            ].map(([ic, h, p], i) => (
              <div key={i} className={`fitem reveal ${i % 2 === 0 ? "d1" : "d2"}`}>
                <div className="ic">{ic}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="blk">
        <div className="wrap">
          <span className="kicker reveal">Ils l'utilisent déjà</span>
          <h2 className="reveal d1">
            Des artisans qui ont
            <br />
            posé leur téléphone.
          </h2>
          <div className="tst">
            {[
              {
                init: "K",
                name: "Karim B.",
                job: "Plombier-chauffagiste · Lyon",
                quote:
                  "En 6 semaines, j'ai signé 11 chantiers que j'aurais raté avant. Ma femme a retrouvé ses soirées.",
              },
              {
                init: "S",
                name: "Sophie L.",
                job: "Peintre en bâtiment · Nantes",
                quote:
                  "Les devis dictés depuis la voiture, c'est magique. Plus de samedi devant l'ordinateur.",
              },
              {
                init: "T",
                name: "Théo M.",
                job: "Électricien · Bordeaux",
                quote:
                  "Les relances toutes seules m'ont récupéré 4 200 € de factures qui traînaient depuis 3 mois.",
              },
            ].map((t, i) => (
              <div key={i} className={`qcard reveal d${i + 1}`}>
                <div className="stars">★★★★★</div>
                <blockquote>« {t.quote} »</blockquote>
                <div className="who">
                  <div className="av">{t.init}</div>
                  <div className="nm">
                    {t.name}
                    <em>{t.job}</em>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="blk">
        <div className="wrap">
          <span className="kicker reveal">Branché à tes outils</span>
          <h2 className="reveal d1">
            Ça se pose sur ce que
            <br />
            tu utilises déjà.
          </h2>
          <p className="lead reveal d2">
            Pas besoin de changer ton numéro, ton agenda ou ton expert-comptable.
            KRAFTY s'intègre.
          </p>
          <div className="ints reveal d3">
            {[
              ["WhatsApp Business", "Conversations clients"],
              ["Google Agenda", "RDV synchronisés"],
              ["Pennylane", "Compta & factures"],
              ["Sage / EBP", "Export comptable"],
              ["Stripe / GoCardless", "Paiements en ligne"],
              ["Chorus Pro", "Facturation publique"],
              ["Google Business", "Avis automatisés"],
              ["SMS / Email", "Notifications instantanées"],
            ].map(([nm, ds], i) => (
              <div key={i} className="it">
                <div className="nm">{nm}</div>
                <div className="ds">{ds}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARCHE + METIERS */}
      <section className="blk dark" id="metiers">
        <div className="wrap">
          <span className="kicker reveal" style={{ color: "#FF8A5C" }}>
            Pour qui
          </span>
          <h2 className="reveal d1">
            Fait pour tous les
            <br />
            métiers de la main.
          </h2>
          <p className="lead reveal d2">
            Un seul produit, qui connaît le vocabulaire de chaque corps de métier.
            On démarre par le bâtiment et l'artisanat de service — un marché énorme
            et sous-équipé.
          </p>
          <div className="mkt reveal d3">
            <div className="m">
              <div className="num">615 000</div>
              <div className="mt">
                entreprises du bâtiment en France.
                <span className="src">Chiffres clés bâtiment 2025</span>
              </div>
            </div>
            <div className="m">
              <div className="num">90 %</div>
              <div className="mt">
                sont des TPE et des artisans — notre cœur de cible.
                <span className="src">Chiffres clés bâtiment 2025</span>
              </div>
            </div>
            <div className="m">
              <div className="num">~520 000</div>
              <div className="mt">
                artisans de 0-9 salariés directement adressables.
                <span className="src">CAPEB / CERC</span>
              </div>
            </div>
          </div>
          <div className="mktnote reveal d3">
            <b>Capter seulement 1 % = ~5 000 artisans, soit ~3 à 5 M€ d'ARR.</b>
            <span>OBJECTIF RÉALISTE À 3 ANS</span>
          </div>
          <div className="tg reveal d3">
            {[
              "Plombier-chauffagiste",
              "Électricien",
              "Maçon",
              "Peintre",
              "Carreleur",
              "Menuisier",
              "Couvreur-zingueur",
              "Paysagiste / Jardinier",
              "Serrurier",
              "Plaquiste",
              "Climaticien",
              "Vitrier",
              "Terrassier",
            ].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="blk">
        <div className="wrap">
          <span className="kicker reveal">La suite</span>
          <h2 className="reveal d1">
            On commence par
            <br />
            une chose. Parfaitement.
          </h2>
          <p className="lead reveal d2">
            KRAFTY n'est pas un gadget à six fonctions à moitié. Chaque brique
            débloque la suivante — voilà la route.
          </p>
          <div className="road2">
            <div className="rc reveal d1">
              <div className="v">
                V1 <em>Maintenant</em>
              </div>
              <h3>Capter chaque client</h3>
              <ul>
                <li>Agent vocal qui décroche 24/7</li>
                <li>Bascule WhatsApp asynchrone</li>
                <li>Questions métier + fourchette de prix</li>
                <li>RDV posé dans l'agenda</li>
              </ul>
            </div>
            <div className="rc reveal d2">
              <div className="v">
                V2 <em>Ensuite</em>
              </div>
              <h3>Devis, facture, cash</h3>
              <ul>
                <li>Devis dicté à la voix</li>
                <li>Facture prête pour la réforme 2026</li>
                <li>Relances d'impayés automatiques</li>
                <li>Suivi des paiements</li>
              </ul>
            </div>
            <div className="rc reveal d3">
              <div className="v">
                V3 <em>Plus tard</em>
              </div>
              <h3>Réputation &amp; preuve</h3>
              <ul>
                <li>Avis Google post-mission</li>
                <li>Suivi photo de chantier</li>
                <li>Analytics &amp; multi-sites</li>
                <li>Intégrations ERP / compta</li>
              </ul>
            </div>
          </div>
          <p className="roadnote reveal d3">
            → La vision : devenir le système d'exploitation de l'artisan. Il pose
            son téléphone, KRAFTY tient toute la relation client — du premier appel
            jusqu'à l'avis cinq étoiles.
          </p>
        </div>
      </section>

      {/* TARIFS */}
      <section className="blk" id="tarifs">
        <div className="wrap">
          <span className="kicker reveal">Tarifs</span>
          <h2 className="reveal d1">
            Simple. Honnête.
            <br />
            Sans surprise.
          </h2>
          <p className="lead reveal d2">
            Pas de fonctionnalité bridée artificiellement. Sans engagement les 3
            premiers mois.
          </p>
          <div className="plans">
            <div className="plan reveal d1">
              <div className="pn">Solo</div>
              <div className="amt">
                39 €<small>/mois HT</small>
              </div>
              <div className="who">Artisan seul, volume modéré.</div>
              <ul>
                <li>Agent voix &amp; WhatsApp 24/7</li>
                <li>Questions métier + fourchette de prix</li>
                <li>Devis &amp; factures illimités</li>
                <li>Prêt facture électronique</li>
              </ul>
              <a href="#contact" className="btn ghost">
                Commencer
              </a>
            </div>
            <div className="plan feat2 reveal d2">
              <div className="pn">Atelier</div>
              <div className="amt">
                89 €<small>/mois HT</small>
              </div>
              <div className="who">Équipe jusqu'à 5 personnes.</div>
              <ul>
                <li>Tout Solo, en illimité</li>
                <li>Multi-utilisateurs</li>
                <li>Relances impayés automatiques</li>
                <li>Accès expert-comptable</li>
              </ul>
              <a href="#contact" className="btn">
                Réserver une démo ›
              </a>
            </div>
            <div className="plan reveal d3">
              <div className="pn">Pro / RGE</div>
              <div className="amt">
                149 €<small>/mois HT</small>
              </div>
              <div className="who">Structures &amp; multi-sites.</div>
              <ul>
                <li>Tout Atelier</li>
                <li>Analytics &amp; multi-sites</li>
                <li>Intégration ERP simple</li>
                <li>Accompagnement dédié</li>
              </ul>
              <a href="#contact" className="btn ghost">
                Nous parler
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="blk">
        <div className="wrap">
          <span className="kicker reveal">Questions fréquentes</span>
          <h2 className="reveal d1">Vous vous demandez sûrement…</h2>
          <div className="faq reveal d2">
            <details open>
              <summary>
                Comment KRAFTY peut-il donner un prix ?<span className="pm">+</span>
              </summary>
              <p>
                Chaque artisan paramètre ses fourchettes de prix dans son tableau
                de bord (dépannage, remplacement, m² posé…). À la fin de l'échange,
                KRAFTY donne au client une estimation indicative basée sur ces
                fourchettes. Le devis précis est confirmé après la visite ou le
                RDV.
              </p>
            </details>
            <details>
              <summary>
                Le client sait-il qu'il parle à une IA ?
                <span className="pm">+</span>
              </summary>
              <p>
                Oui. KRAFTY se présente clairement comme l'assistant de ton
                entreprise. La voix te ressemble pour rassurer le client, sans
                jamais chercher à le tromper. Et s'il veut absolument un humain,
                KRAFTY te prévient pour un rappel.
              </p>
            </details>
            <details>
              <summary>
                Les questions sont-elles adaptées à mon métier ?
                <span className="pm">+</span>
              </summary>
              <p>
                Oui. KRAFTY connaît le vocabulaire et les bonnes questions de
                chaque corps de métier — un plombier ne qualifie pas comme un
                paysagiste. Tu ajustes les scénarios à ta façon de travailler
                depuis ton panneau de configuration.
              </p>
            </details>
            <details>
              <summary>
                Ça marche avec mon numéro actuel ?<span className="pm">+</span>
              </summary>
              <p>
                Oui. On met en place un renvoi d'appel depuis ton numéro existant.
                Rien ne change pour tes clients. On peut aussi te fournir un numéro
                dédié si tu préfères.
              </p>
            </details>
            <details>
              <summary>
                Et la facture électronique 2026 ?<span className="pm">+</span>
              </summary>
              <p>
                KRAFTY génère des devis et factures prêts pour la réforme et se
                branche sur une plateforme agréée. Tu es accompagné sur la
                réception (obligatoire au 1ᵉʳ septembre 2026) et prêt pour
                l'émission (étendue aux TPE au 1ᵉʳ septembre 2027).
              </p>
            </details>
            <details>
              <summary>
                Mes données restent en France ?<span className="pm">+</span>
              </summary>
              <p>
                Oui. Hébergement souverain en France, conforme RGPD. Aucune
                conversation n'est partagée ou réutilisée pour entraîner des
                modèles externes.
              </p>
            </details>
            <details>
              <summary>
                Combien de temps pour être opérationnel ?
                <span className="pm">+</span>
              </summary>
              <p>
                Une visio de 20 minutes pour cadrer ton métier, tes spécialités,
                tes fourchettes. KRAFTY est en ligne sous 48h, voix entraînée
                comprise.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="blk dark final" id="contact">
        <div className="wrap">
          <span
            className="kicker reveal"
            style={{ color: "#FF8A5C", justifyContent: "center" }}
          >
            Les 30 premiers artisans
          </span>
          <h2 className="reveal d1">
            Pose l'outil.
            <br />
            KRAFTY <span className="acc">répond.</span>
          </h2>
          <p className="lead reveal d2">
            On accompagne personnellement nos premiers artisans. 20 minutes pour
            nous expliquer ton métier — on s'occupe du reste.
          </p>
          <div className="cta reveal d3">
            <a href="mailto:bonjour@krafty.fr" className="btn">
              Réserver une démo ›
            </a>
            <a href="#tarifs" className="btn gd">
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>

      <footer className="k-footer">
        <div className="wrap ft">
          <div>
            <div className="logo">
              KRAFTY<b>.</b>
            </div>
            <p>
              L'assistant IA des artisans du bâtiment. Répond, qualifie, chiffre,
              facture — pendant que tu bosses.
            </p>
          </div>
          <div className="meta">
            bonjour@krafty.fr
            <br />
            Jad · Redwane · Brahim
            <br />
            Hébergé en France 🇫🇷 · RGPD
            <br />© 2026 KRAFTY
          </div>
        </div>
      </footer>
    </>
  );
}
