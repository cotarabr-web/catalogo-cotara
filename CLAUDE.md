# CLAUDE.md — Catálogo Cotara (novo site)

Lido automaticamente pelo Claude Code na raiz do repositório. **Este é um projeto novo, não uma evolução do repositório atual** (`Catalo-Digital-L-via`, hoje no GitHub Pages). O site antigo é referência de estrutura de dados e de lógica (carrinho, WhatsApp), nunca de conteúdo — os textos de produto de lá têm violação de compliance e não devem ser copiados como estão.

## 1. Por que site novo, não iteração no antigo

Dois motivos, os dois já resolvidos aqui: (1) o catálogo atual tem descrições de produto com "tratar/tratamento/previne/câncer/HIV" — risco regulatório real, publicado agora; (2) o design atual não é o padrão visual que a marca quer daqui pra frente. Construir do zero, com copy compliance-first e o design novo, é mais rápido que tentar consertar os dois problemas em cima da base antiga.

## 2. Regras de negócio (não negociável)

- **Wording ANVISA obrigatório:** "auxilia", "contribui". Nunca "trata", "cura", "previne", nem citação de doença grave (câncer, HIV, leucemia etc.) como alvo do produto — mesmo que a fonte original (fornecedor, folheto, site antigo) use essas palavras. Reescrever, nunca copiar.
- Produto em mais de uma categoria aparece nas duas, sem duplicar cadastro (array de categorias por produto — o `produtos.js` antigo já faz isso certo, reaproveitar a estrutura).
- Naturea by Cotara, quando mencionada, sempre endossada pela Cotara.

## 3. Estrutura da experiência

### 3.1 Landing page
- **Hero fotorrealista:** frasco de vidro âmbar sobre rocha coberta de musgo, campo de grama, luz dourada de fim de tarde — imagem original (gerada ou fotografada), nunca derivada de foto de terceiros. Prompt de geração já validado, ver seção 4.
- **Barra de navegação em pílula, sobreposta na parte inferior do hero** (estilo glass/blur, referência: site da LTX): primeiro item é o CTA principal **"O que você está sentindo hoje? →"**, os seguintes são atalhos de categoria manual (Sono, Hormônios, Intestino, Imunidade...).
- Abaixo, ao rolar: lista completa de produtos em ordem alfabética (o site antigo já tem essa ordenação pronta, é só fixar como seção sempre visível).
- Categorias sem produto ainda: card "Em breve".

### 3.2 Fluxo de busca por sintoma
1. Clique no CTA "O que você está sentindo hoje?" abre modal com **corpo humano em estilo wireframe** (line art) — **essa linguagem visual fica restrita ao modal**, não sangra pro resto do site, que é fotorrealista/editorial. São dois momentos diferentes da experiência, não precisam competir na mesma tela.
2. Lista de sintomas/áreas ao lado do wireframe; seleção dá foco visual na região correspondente do modelo.
3. Confirmação → navega pra `/categoria/[slug]` com a curadoria daquele sintoma.

Mapeamento sugerido de áreas do corpo (agrupando as tags `doencas` que já existem no catálogo antigo, evita expor 28 opções no modal):

| Área do corpo (wireframe) | Tags de origem |
|---|---|
| Intestino / Digestão | Digestão, Estômago, Intestino |
| Fígado / Rins | Fígado, Rins, Bexiga |
| Hormônios | Feminino, Hormônios, Masculino |
| Sono / Ansiedade | Sono, Ansiedade, Relaxamento, Humor |
| Coração / Pressão | Pressão, Coração, Circulação, Colesterol |
| Imunidade / Garganta | Imunidade, Garganta |
| Anti-inflamatório / Dores | Anti-inflamatório, Dores |
| Respiratório | Respiratório |
| Diabetes | Diabetes |
| Energia / Memória | Energia, Disposição, Memória |
| Pele / Cabelos | Pele, Cabelos |

"Cuidados Pessoais" e os tipos de produto (Extratos, Óleos Vegetais, Óleos Essenciais) ficam de fora do wireframe — ativam como atalho manual na pílula, não como sintoma.

### 3.3 Página de categoria
- Produtos curados pro sintoma: nome, descrição (reescrita, compliance), preço, adicionar ao carrinho.

### 3.4 Carrinho
- Confirmado: fecha pedido via **WhatsApp**, sem checkout/pagamento online. Reaproveitar a lógica do site antigo (`montarMensagem()`, `finalizar()`) quase 1:1 — essa parte já funciona bem.

## 4. Direção visual

- **Movimento no hero:** recomendo animação só em CSS sobre a imagem estática (efeito Ken Burns — zoom/pan lento e contínuo, 20–30s de loop) como padrão. Zero asset extra, zero peso de dados no celular do cliente, Claude Code implementa direto. Vídeo de fundo (loop curto, mudo, com a imagem estática como poster/fallback) é upgrade válido depois que o site estiver no ar e validado — mas adiciona peso de arquivo e exige plano de fallback pra conexão fraca, então não é bloqueante pro lançamento.

- **Hero:** fotografia/imagem ultra-realista, estilo still de campanha premium. Prompt validado (gerar como imagem original, não editar foto de terceiros):

  > *Fotografia ultra-realista, still de campanha publicitária premium. Uma rocha coberta de musgo verde vibrante no meio de um campo de grama alta, sob luz dourada de fim de tarde, céu claro ao fundo com montanhas desfocadas. Sobre a rocha, um frasco de vidro âmbar tipo conta-gotas (frasco de extrato fitoterápico premium), com um brilho quente e suave saindo de dentro do frasco. Composição centralizada, profundidade de campo rasa, foco nítido no frasco, grama e flores silvestres brancas desfocadas em primeiro plano. Estilo fotografia de produto cinematográfica, cores quentes e naturais, atmosfera calma e orgânica, sem texto, sem marca d'água. Proporção 16:9.*

- **Tipografia:** serifada pro headline do hero (clima editorial, como a referência do toca-discos); sans-serif limpa pra UI/pílula de navegação (como a referência da LTX).
- **Pílula de navegação:** fundo translúcido/glass blur, sobreposta ao terço inferior do hero, primeiro item sempre o CTA de sintoma.
- **Paleta:** manter verde-profundo/verde-sálvia como cor de marca (CTA, badges, elementos de interface), deixando o calor da fotografia (dourado/âmbar) carregar o clima do hero. Não é pra brigar com a foto — a paleta antiga do site atual pode seguir valendo pra UI, só não pro hero.
- Wireframe do corpo: line art, minimalista, técnico — confinado ao modal (seção 3.2).

## 5. Dados

- **`produtos.js` já reescrito e pronto para uso** — arquivo `produtos-compliance.js`, mesma estrutura do catálogo antigo (nome, cat, doencas[], img, preco, desc, descLonga), com todo `desc`/`descLonga` revisado pra compliance ANVISA. É uma passada de linguagem, não certificação regulatória — revisar com quem cuida do registro/rotulagem antes de publicar. Dois pontos em aberto sinalizados no cabeçalho do arquivo: os nomes "Antiparasitário Natural" e "Regeneração Hepática" carregam alegação médica no próprio nome do produto, não só na descrição — decisão de renomear ou não é sua.
- Colocar o `produtos.js` antigo em `/design-references/legacy/produtos-antigo.js` só como referência de dado bruto (preço, categoria, princípio ativo) — nunca importar direto no site novo.
- Nova área do corpo (tabela da seção 3.2) vira arquivo de dado próprio, ex. `areas-corpo.js`.

## 6. Stack técnica

- HTML/CSS/JS puro (sem framework) — mesma decisão de antes, ainda vale: site estático, sem necessidade de servidor, deploy direto (GitHub Pages ou Vercel, sem build).
- `framer-motion` não se aplica fora de React — usar GSAP (via CDN) pra animação do wireframe e transições do modal/carrinho, se quiser mais polimento do que CSS puro entrega.
- Estrutura de arquivos:
  ```
  /index.html
  /css/style.css
  /js/produtos.js
  /js/areas-corpo.js
  /js/app.js
  /design-references
    /prints/                     → as duas referências visuais enviadas
    /hero-direcao.md              → prompt + notas de composição (seção 4)
    /legacy/produtos-antigo.js    → só estrutura/preço, nunca descrição
  ```

## 7. Fluxo de trabalho recomendado

1. Gerar/produzir a imagem do hero (fora do Claude Code) — prompt pronto na seção 4.
2. Reescrever as descrições de produto (compliance ANVISA) a partir do dado antigo — pode ser feito comigo antes de abrir o Claude Code, ou como primeira tarefa dentro dele.
3. Scaffold: estrutura de pastas da seção 6, `git init`.
4. Landing estática: hero (com a imagem final) + pílula de navegação (sem interação ainda) + lista alfabética.
5. Modal de busca por sintoma: wireframe + seleção + destaque + confirmação + navegação.
6. Página de categoria + carrinho + WhatsApp (reaproveitando lógica do site antigo).
7. Revisão mobile + checklist de compliance (seção 8) rodado em cada descrição.
8. Deploy (GitHub Pages ou Vercel).

Um prompt por fase. O hero (imagem + pílula sobreposta) e o modal de sintoma merecem sessões próprias — são os dois pontos de maior complexidade visual do projeto.

## 8. Checklist de compliance

- [ ] Nenhuma ocorrência de "trata", "tratamento", "cura", "previne".
- [ ] Nenhuma menção a câncer, HIV, leucemia ou outra doença grave como alvo do produto.
- [ ] Toda descrição nova foi reescrita, não copiada do site antigo.
- [ ] Categorias "em breve" sem CTA de compra.

## 9. Comandos

Sem build step — abrir `index.html` direto ou servir com qualquer servidor estático local (`npx serve`, por exemplo) durante o desenvolvimento.
