import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import heroImg from "../assets/hero.jpg";
import trade1 from "../assets/trade-1.jpg";
import trade2 from "../assets/trade-2.jpg";
import trade3 from "../assets/trade-3.jpg";
import phoneImg from "../assets/phone-hand.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KRAFTY — L'assistant qui répond pour les artisans" },
      {
        name: "description",
        content:
          "Un assistant vocal qui décroche, qualifie et planifie pour les artisans. Vous travaillez. Lui répond. 24/7.",
      },
      { property: "og:title", content: "KRAFTY — L'assistant qui répond pour les artisans" },
      {
        property: "og:description",
        content:
          "Un assistant vocal qui décroche, qualifie et planifie pour les artisans. Vous travaillez. Lui répond. 24/7.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function useScrolled(threshold = 80) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const onScroll = () => setS(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return s;
}

function Index() {
  const scrolled = useScrolled(600);
  const r1 = useReveal<HTMLDivElement>();
  const r2 = useReveal<HTMLDivElement>();
  const r3 = useReveal<HTMLDivElement>();
  const r4 = useReveal<HTMLDivElement>();
  const r5 = useReveal<HTMLDivElement>();
  const r6 = useReveal<HTMLDivElement>();

  return (
    <main>
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="logo">krafty</a>
        <div className="links">
          <a href="#produit">Produit</a>
          <a href="#metiers">Métiers</a>
          <a href="#methode">Méthode</a>
          <a href="#histoire">Histoire</a>
        </div>
        <a href="#contact" className={`pill ${scrolled ? "pill-dark" : "pill-light"}`}>
          Réserver une démo
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <img src={heroImg} alt="Artisan dans son atelier" className="hero-img" width={1920} height={1080} />
        <div className="hero-veil" />
        <div className="hero-inner">
          <div className="hero-row">
            <h1>Vous travaillez. On répond.</h1>
            <div>
              <p className="sub">
                Un assistant vocal calme, précis et disponible. Pour les artisans qui n'ont plus le temps de décrocher,
                mais qui ne veulent rien rater.
              </p>
              <div className="hero-ctas">
                <a href="#contact" className="pill pill-light">Réserver une démo</a>
                <a href="#produit" className="pill pill-ghost">Voir comment ça marche</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="strip">
        <div className="strip-track">
          {[..."Plombiers · Électriciens · Menuisiers · Maçons · Couvreurs · Peintres · Carreleurs · Chauffagistes · Serruriers".split(" · "),
            ..."Plombiers · Électriciens · Menuisiers · Maçons · Couvreurs · Peintres · Carreleurs · Chauffagistes · Serruriers".split(" · ")].map((t, i) => (
            <span key={i}>— {t}</span>
          ))}
        </div>
      </div>

      {/* MANIFEST */}
      <section className="sec" id="produit">
        <div className="wrap reveal" ref={r1}>
          <div className="eyebrow">Le produit</div>
          <p className="manifest">
            Un seul outil. <em>Il décroche, comprend la demande, propose un créneau, envoie un SMS de confirmation.</em> Sans
            que vous quittiez le chantier.
          </p>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="reveal" ref={r2}>
        <div className="caps">
          <div className="cap">
            <span className="num">01</span>
            <div>
              <h3>Il décroche à chaque appel.</h3>
              <p>Jour, nuit, week-end. Plus jamais une sonnerie dans le vide pendant que vous êtes en hauteur.</p>
            </div>
          </div>
          <div className="cap">
            <span className="num">02</span>
            <div>
              <h3>Il qualifie le besoin.</h3>
              <p>Nature du chantier, urgence, adresse, photos. Vous recevez une fiche claire, prête à chiffrer.</p>
            </div>
          </div>
          <div className="cap">
            <span className="num">03</span>
            <div>
              <h3>Il pose un créneau.</h3>
              <p>Synchronisé avec votre agenda. Confirmation par SMS. Rappel automatique la veille.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRADES (cinematic) */}
      <section className="sec" id="metiers">
        <div className="wrap">
          <div className="sec-head reveal" ref={r3}>
            <div>
              <div className="eyebrow">Pour qui</div>
              <h2 className="sec-title">Fait pour ceux qui ont les mains prises.</h2>
            </div>
            <p className="sec-aside">
              Calibré sur le vocabulaire et les urgences de chaque métier. Pas un chatbot générique — un collègue qui
              connaît le terrain.
            </p>
          </div>
          <div className="trades">
            <div className="trade">
              <img src={trade1} alt="Plomberie" loading="lazy" width={1280} height={1600} />
              <div className="trade-cap">
                <h4>Plomberie</h4>
                <span>Urgences fuite, chaudière</span>
              </div>
            </div>
            <div className="trade">
              <img src={trade2} alt="Électricité" loading="lazy" width={1280} height={1600} />
              <div className="trade-cap">
                <h4>Électricité</h4>
                <span>Mise aux normes, dépannage</span>
              </div>
            </div>
            <div className="trade">
              <img src={trade3} alt="Menuiserie" loading="lazy" width={1280} height={1600} />
              <div className="trade-cap">
                <h4>Menuiserie</h4>
                <span>Devis sur mesure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec">
        <div className="wrap reveal" ref={r4}>
          <div className="sec-head">
            <div>
              <div className="eyebrow">Ce que ça change</div>
              <h2 className="sec-title">Moins d'appels manqués. Plus de chantiers signés.</h2>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="num">3×</div>
              <div className="lab">de demandes traitées en moyenne, dès la première semaine.</div>
            </div>
            <div className="stat">
              <div className="num">24/7</div>
              <div className="lab">Disponible la nuit, les jours fériés, pendant vos rendez-vous.</div>
            </div>
            <div className="stat">
              <div className="num">12 min</div>
              <div className="lab">Installation. Un numéro à dévier. C'est tout.</div>
            </div>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="sec dark" id="methode">
        <div className="wrap">
          <div className="sec-head reveal" ref={r5}>
            <div>
              <div className="eyebrow">La méthode</div>
              <h2 className="sec-title">Quatre étapes. Aucun jargon.</h2>
            </div>
            <p className="sec-aside" style={{ opacity: .55 }}>
              Vous gardez votre numéro. Vous gardez votre façon de bosser. On ajoute juste une oreille en plus.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <span className="n">01 — Appel</span>
              <h4>Un client appelle.</h4>
              <p>Votre numéro habituel sonne. Si vous ne décrochez pas, Krafty prend le relais.</p>
            </div>
            <div className="step">
              <span className="n">02 — Conversation</span>
              <h4>Il écoute, il comprend.</h4>
              <p>Voix naturelle. Il reformule la demande, pose les bonnes questions, rassure.</p>
            </div>
            <div className="step">
              <span className="n">03 — Fiche</span>
              <h4>Vous recevez un résumé.</h4>
              <p>SMS et email. Contact, adresse, photos, niveau d'urgence. Prêt à chiffrer.</p>
            </div>
            <div className="step">
              <span className="n">04 — Suivi</span>
              <h4>Le client est rappelé.</h4>
              <p>Confirmation automatique, rappel la veille, relance si besoin. Vous restez sur le chantier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="sec">
        <div className="wrap reveal" ref={r6}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 60, alignItems: "center" }} className="quote-grid">
            <div>
              <div className="eyebrow">Histoire</div>
              <p className="quote">
                « Avant, je rappelais le soir, fatigué. Maintenant, le devis est déjà parti quand je rentre. »
              </p>
              <p className="quote-author">— Karim, plombier-chauffagiste, Lyon</p>
            </div>
            <div>
              <img src={phoneImg} alt="Téléphone dans la main d'un artisan" loading="lazy" width={1600} height={1200} style={{ width: "100%", borderRadius: 4, aspectRatio: "4/3", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact">
        <div className="cta-final">
          <h2>Un appel manqué, c'est un chantier perdu.</h2>
          <p className="sub">Démo en 15 minutes. Sans engagement. Vous verrez ce que Krafty dirait à votre prochain client.</p>
          <div className="ctas">
            <a href="mailto:hello@krafty.fr" className="pill pill-light">Réserver une démo</a>
            <a href="tel:+33000000000" className="pill pill-ghost">Parler à un humain</a>
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 Krafty — Fait en France, pour les mains qui font.</span>
        <div className="links-f">
          <a href="#">Mentions légales</a>
          <a href="#">Confidentialité</a>
          <a href="mailto:hello@krafty.fr">Contact</a>
        </div>
      </footer>
    </main>
  );
}
