# Aqui aceita Bitcoin?

Um projeto do Clube BR⚡LN para difundir o uso de Bitcoin como meio de pagamento em estabelecimentos comerciais.

## Sobre o Projeto

Inspirado no projeto de Rolante-RS, que conseguiu com sucesso a adesão de mais de 200 estabelecimentos na cidade que aceitam Bitcoin, nosso projeto "Aqui aceita Bitcoin?" visa difundir o Bitcoin como moeda forte em Carambeí e região dos Campos Gerais.

Nossa meta é criar mais de 1000 estabelecimentos que aceitem esta nova tecnologia, facilitando o primeiro contato das pessoas com o Bitcoin sem necessidade de entender conceitos complexos inicialmente.

## Funcionalidades

- **Mapa de Estabelecimentos**: Integração com o BTC Maps para visualizar estabelecimentos que aceitam Bitcoin
- **Contador Interativo**: Visualização em tempo real do número de estabelecimentos na área visível do mapa
- **Gráfico de Crescimento**: Visualização do crescimento da adoção de Bitcoin ao longo do tempo com períodos ajustáveis
- **Cadastro Manual**: Interface simples para cadastro de novos estabelecimentos
- **Sistema de Flags**: Indicadores visuais para acompanhar o status dos estabelecimentos (pendente, sincronizado, verificado)
- **Relatórios e Estatísticas**: Visualização de dados sobre estabelecimentos cadastrados
- **Gerador de Conteúdo**: Criação automática de posts para redes sociais
- **Sistema de Auditoria**: Registro completo de todas as ações realizadas no sistema

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript puro (sem frameworks)
- Chart.js para visualização de dados e gráficos interativos
- Armazenamento local (localStorage) para dados
- Integração com BTC Maps via iframe
- Design responsivo para dispositivos móveis e desktop

## Instalação

1. Clone este repositório:
   ```
   git clone https://github.com/clubebrln/aqui-aceita-bitcoin.git
   ```

2. Abra o arquivo `index.html` em seu navegador para acessar a página principal.

3. Para acessar o painel de administração, abra o arquivo `admin.html`.

4. Para cadastrar novos estabelecimentos, acesse `cadastro-manual.html`.

## Uso

### Cadastro de Estabelecimentos

1. Acesse a página de cadastro clicando em "Cadastrar" no menu principal.
2. Preencha o formulário com os dados do estabelecimento.
3. Clique em "Cadastrar" para salvar o estabelecimento.

### Visualização de Estabelecimentos

1. Na página principal, você pode ver o mapa do BTC Maps com todos os estabelecimentos cadastrados.
2. O contador interativo no canto superior direito do mapa mostra o número de estabelecimentos na região visível.
3. Use os botões de zoom (+/-) no contador para navegar entre diferentes regiões.
4. Para ver a lista completa de estabelecimentos, acesse a página de cadastro e clique na aba "Lista".

### Análise de Crescimento

1. Abaixo do mapa, você encontrará um gráfico interativo que mostra o crescimento da adoção de Bitcoin ao longo do tempo.
2. Use os botões de período para ajustar a visualização: "Todo o período", "Último ano" ou "Últimos 6 meses".
3. O gráfico se atualiza automaticamente quando você navega para diferentes regiões no mapa.

### Sincronização com BTC Maps

1. Acesse a página de administração.
2. Na lista de estabelecimentos, clique em "Sincronizado" para marcar um estabelecimento como sincronizado com o BTC Maps.

### Geração de Conteúdo para Redes Sociais

1. Acesse a página de administração.
2. Na seção de redes sociais, você encontrará posts gerados automaticamente com base nos dados dos estabelecimentos.
3. Clique em "Copiar" para copiar o conteúdo para a área de transferência.

## Estrutura do Projeto

```
aqui-aceita-bitcoin/
├── index.html              # Página principal
├── cadastro-manual.html    # Página de cadastro de estabelecimentos
├── admin.html              # Painel de administração
├── css/
│   ├── styles.css          # Estilos principais
│   ├── bitcoin-maps.css    # Estilos para o mapa
│   └── wallet-guide.css    # Estilos para o guia de carteiras
├── js/
│   ├── app.js              # Arquivo principal de JavaScript
│   ├── btcmap-stats.js     # Contador interativo e gráfico de crescimento
│   ├── estatisticas-manager.js  # Gerenciador de estatísticas
│   ├── social-media-generator.js  # Gerador de conteúdo para redes sociais
│   ├── auditoria-manager.js  # Sistema de auditoria
│   └── test-suite.js       # Suite de testes
└── assets/
    └── images/             # Imagens e logos
```

## Personalização do Contador e Gráfico

O contador interativo e o gráfico de crescimento podem ser personalizados editando o arquivo `js/btcmap-stats.js`:

- **Dados de regiões**: Atualize o objeto `regionData` com os números reais de estabelecimentos em cada região.
- **Dados históricos**: Modifique o objeto `growthData` para refletir o crescimento real ao longo do tempo.
- **Níveis de zoom**: Ajuste o array `zoomLevels` para mapear diferentes níveis de zoom para regiões específicas.
- **Aparência visual**: Personalize as cores, tamanhos e estilos dos elementos do contador e do gráfico.

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Clube BR⚡LN - contato@clubebrln.org

---

⚡ Desenvolvido pelo     Clube BR⚡LN
