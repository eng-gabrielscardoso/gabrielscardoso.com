---
title: Por que reescrevi este portfólio

description: Um site datado, um deploy que explodiu e um ego ferido. Três motivos, sendo que apenas dois são tecnicamente defensáveis.

date: '2026-08-11'

tags:
  - laravel
  - nuxt
  - deploy

translated: true
---

Vou poupar teu tempo: dos três motivos que me levaram a jogar meu portfólio anterior no lixo, dois são técnicos e defensáveis em uma reunião. O terceiro é birra pura. Vou começar pelos respeitáveis, para preservar alguma dignidade antes da confissão.

## O site antigo estava datado — e falava por alguém que eu não sou mais

Meu portfólio anterior era uma cápsula do tempo. Não no sentido charmoso de "olha que vintage", mas no sentido de sótão de vó: cheio de coisas que fizeram sentido um dia e que hoje só acumulam poeira e vergonha alheia.

O problema não era a tecnologia em si — era o descompasso. Ando enfiado em Go e Rust, lendo sobre concorrência e gerenciamento de memória como se isso fosse um hobby saudável, enquanto meu site continuava jurando de pé junto que meu amor eterno era um monolito PHP. Nada contra: PHP pagou minhas contas com uma lealdade que nenhum recrutador jamais demonstrou. Mas manter um portfólio que descreve quem deixaste de ser é o equivalente digital a usar uma foto de perfil de oito anos atrás (e sim, a minha foto de perfil tem exatos 3 anos, ainda tenho 5 de sobra). Tecnicamente é tu. Mas todo mundo leva um susto no encontro presencial.

Também havia o detalhe de que um portfólio existe, teoricamente, para me representar. Se ele representa um profissional que não existe mais, ele deixou de ser portfólio e virou obituário.

## Nuxt, porque sou preguiçoso e pelo menos sou honesto quanto a isso

Eu amo Nuxt. Não de um jeito racional e ponderado, com benchmarks e planilha comparativa. Amo do jeito problemático: sem justificativa técnica suficiente e com disposição para discutir sobre isso. Eu apenas gosto. Tem tudo no devido lugar.

A escolha, portanto, foi óbvia até para os meus padrões. O que eu quero de um portfólio é escrever um `.md`, dar push e ir dormir. É literalmente isso. Não quero um cluster Kubernetes com três nós, service mesh e observabilidade distribuída para servir seis páginas e um formulário de contato que recebe dois e-mails por mês — sendo que um deles sou eu, testando se o formulário funciona (as vezes os dois).

Nuxt entrega exatamente essa preguiça bem resolvida: conteúdo em arquivo, build que não me faz negociar com um bundler, e deploy que termina antes de eu perder o interesse. Escolher qualquer coisa mais sofisticada seria construir uma refinaria para fritar um ovo.

## O deploy explodiu e eu, sendo uma pessoa emocionalmente equilibrada, reescrevi tudo

Agora a birra.

Uma pipeline quebrou. Um deploy falhou por um daqueles motivos que só existem em produção e desaparecem quando você tenta reproduzir localmente. A resposta madura seria abrir o log, encontrar o erro, corrigir em vinte minutos e seguir com a vida.

Não foi o que aconteceu. Eu olhei aquele log, respirei fundo, e concluí — com toda a serenidade de um adulto bem resolvido — que o problema não era o erro. Era o projeto inteiro. E a arquitetura. E as escolhas do meu eu do passado. E, muito possivelmente, a indústria de software como um todo. Então apaguei tudo e comecei de novo.

Sim, sou dramático. Reescrever um projeto porque um deploy falhou é como se mudar de cidade porque a torneira da pia começou a pingar. Na minha defesa, contudo: a torneira pingava havia meses, e eu já não gostava da cidade (não ironicamente isso não é apenas uma metáfora).

## O que sobrou disso

Um site que carrega rápido, que eu atualizo escrevendo Markdown como uma pessoa civilizada, e que descreve o profissional que eu sou hoje em vez do que eu era quando ainda acreditava em estimativas de sprint.

Mas o ganho real foi outro, e é meio embaraçoso admitir: eu me divertir. Passei tempo demais trancafiado em projetos de cliente, onde cada decisão precisa de justificativa, aprovação e um card no board. Aqui eu escolhi as tecnologias porque quis, escrevi os textos com o tom que quis, e não precisei convencer ninguém de nada.

Se um deploy quebrado foi o preço para lembrar que programar pode ser divertido, foi barato. Ainda estou puto, mas foi barato.
