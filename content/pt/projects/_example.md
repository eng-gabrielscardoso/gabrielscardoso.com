---
# Modelo — copie, renomeie (ex.: `my-project.md`) e preencha.
# Arquivos que começam com `_` nunca são indexados, então este aqui não vai para o site.
# Use o MESMO nome de arquivo usado em `content/en/projects/`: o nome do arquivo
# vira a URL, então `my-project.md` é servido em `/projects/my-project`
# e `/pt/projects/my-project`.

# Título do card e da página.
title: Projeto de Exemplo

# Empresa, cliente ou "Projeto pessoal".
association: Projeto pessoal

# Opcional — demo ou repositório. Apague se não houver link.
link: https://github.com/seu-usuario/example-project

# Opcional — coloque o arquivo em `public/images/` e referencie a partir da raiz.
# Apague esta linha para renderizar o card sem imagem de capa.
image: /images/example-project.webp

# Sempre use aspas nas datas. Formato: "YYYY-MM".
startDate: '2025-01'

# Apague esta linha enquanto o projeto estiver ativo — ele recebe o selo "Active".
endDate: '2025-08'

# Use true para exibir o projeto na home. Mantenha a lista curta.
featured: true

# Opcional — marca este arquivo como tradução do original em inglês.
translated: true
---

Tudo abaixo do front matter é o corpo da página do projeto, escrito em Markdown.

## O problema

Descreva o que estava quebrado ou faltando, e quem era afetado.

## A abordagem

Explique as decisões que importaram e os trade-offs que você aceitou.

- Escolhas de arquitetura que você defenderia
- Restrições que moldaram o desenho
- O que você faria diferente hoje

## O resultado

Termine com resultados. Números convencem mais que adjetivos: latência, custo,
adoção, tempo de build, taxa de erro.
