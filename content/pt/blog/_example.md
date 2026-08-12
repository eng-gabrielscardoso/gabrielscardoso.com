---
# Modelo — copie, renomeie (ex.: `my-first-post.md`) e preencha.
# Arquivos que começam com `_` nunca são indexados, então este aqui não vai para o site.
# Use o MESMO nome de arquivo usado em `content/en/blog/`: o nome do arquivo vira
# a URL, então `my-first-post.md` é servido em `/blog/my-first-post`
# e `/pt/blog/my-first-post`.

# Título do post, exibido no card e como título da página.
title: Post de Exemplo

# Uma ou duas frases. Usado no card e como descrição de SEO.
description: Um resumo curto que faz alguém decidir se vale continuar lendo.

# Sempre use aspas nas datas, senão o YAML converte para objeto Date.
# Formato: "YYYY-MM-DD". A listagem ordena por este campo, do mais recente ao mais antigo.
date: '2025-08-11'

# Opcional — renderizado como badges. Apague o bloco se não quiser tags.
tags:
  - nuxt
  - typescript
---

Tudo abaixo do front matter é o corpo do post, escrito em Markdown.

## Comece pelo ponto

Abra com o que você quer que o leitor lembre. Deixe a construção para depois —
as pessoas leem em diagonal, e o primeiro parágrafo é o único garantido.

## Mostre o código

```ts
export function greet(name: string): string {
  return `Olá, ${name}`
}
```

## Feche com o que mudou

Termine com o aprendizado prático: o que você faria diferente, ou o que o leitor
deveria testar em seguida.
