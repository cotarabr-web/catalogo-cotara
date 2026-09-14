/*
 * ÁREAS DO CORPO — mapeamento do modal de busca por sintoma (wireframe).
 * Tags conferidas 1:1 contra js/produtos.js (68 produtos) — únicos órfãos são os
 * 2 desodorantes "Cuidados Pessoais", fora por design.
 *
 * hotspot: coordenadas percentuais (x/y, 0-100) sobre a imagem
 * design-references/wireframe-corpo-otimizado.jpg (silhueta em pé, vista de
 * frente), y=0 topo da cabeça, y=100 pés — calibrado pelo olho contra essa
 * imagem, ajustar se a imagem do wireframe mudar de novo. "sono-ansiedade"
 * tem hotspot null de propósito — é sistêmico, tratado como halo/glow na
 * silhueta inteira, não um ponto.
 */

const areasCorpo = [
  { slug: "pele-cabelos", label: "Pele / Cabelos",
    tags: ["Pele", "Cabelos"], hotspot: { x: 50, y: 4 } },
  { slug: "energia-memoria", label: "Energia / Memória",
    tags: ["Energia", "Disposição", "Memória"], hotspot: { x: 50, y: 9 } },
  { slug: "imunidade-garganta", label: "Imunidade / Garganta",
    tags: ["Imunidade", "Garganta"], hotspot: { x: 50, y: 18 } },
  { slug: "coracao-pressao", label: "Coração / Pressão",
    tags: ["Pressão", "Coração", "Circulação", "Colesterol"], hotspot: { x: 44, y: 32 } },
  { slug: "respiratorio", label: "Respiratório",
    tags: ["Respiratório"], hotspot: { x: 56, y: 30 } },
  { slug: "figado-rins", label: "Fígado / Rins",
    tags: ["Fígado", "Rins", "Bexiga"], hotspot: { x: 60, y: 39 } },
  { slug: "diabetes", label: "Diabetes",
    tags: ["Diabetes"], hotspot: { x: 41, y: 39 } },
  { slug: "intestino-digestao", label: "Intestino / Digestão",
    tags: ["Digestão", "Estômago", "Intestino", "Gastrite"], hotspot: { x: 50, y: 46 } },
  { slug: "hormonios", label: "Hormônios",
    tags: ["Feminino", "Hormônios", "Masculino"], hotspot: { x: 50, y: 52 } },
  { slug: "anti-inflamatorio-dores", label: "Anti-inflamatório / Dores",
    tags: ["Anti-inflamatório", "Dores"], hotspot: { x: 50, y: 72 } },
  { slug: "sono-ansiedade", label: "Sono / Ansiedade",
    tags: ["Sono", "Ansiedade", "Relaxamento", "Humor"], hotspot: null }
];
