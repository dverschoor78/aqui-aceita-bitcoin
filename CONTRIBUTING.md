# Contribuindo para o projeto "Aqui aceita Bitcoin?"

Obrigado por considerar contribuir para o projeto "Aqui aceita Bitcoin?"! Este documento fornece diretrizes para contribuir com o projeto.

## Como Contribuir

### Reportando Bugs

Se você encontrou um bug, por favor abra uma issue no GitHub com as seguintes informações:

1. Um título claro e descritivo
2. Passos detalhados para reproduzir o bug
3. Comportamento esperado vs. comportamento observado
4. Screenshots, se aplicável
5. Informações sobre seu ambiente (navegador, sistema operacional, etc.)

### Sugerindo Melhorias

Para sugerir melhorias, abra uma issue no GitHub descrevendo:

1. Sua ideia de melhoria
2. Por que essa melhoria seria útil
3. Como você imagina que essa melhoria funcionaria

### Enviando Pull Requests

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

### Padrões de Código

- Indente com 2 espaços para HTML, CSS e JavaScript
- Use 4 espaços para Python
- Siga as convenções de nomenclatura existentes
- Adicione comentários para código complexo
- Mantenha o código limpo e legível

## Processo de Desenvolvimento

1. Escolha uma issue para trabalhar ou crie uma nova
2. Discuta a abordagem na issue antes de começar a implementação
3. Implemente sua solução
4. Teste localmente
5. Envie um Pull Request
6. Responda a quaisquer comentários de revisão

## Estrutura do Projeto

```
aqui-aceita-bitcoin/
├── api/                  # API de integração com OpenStreetMap
│   └── btcmap/           # Módulos para integração com BTC Map
├── assets/               # Recursos estáticos
│   └── images/           # Imagens do site
├── css/                  # Arquivos CSS
├── js/                   # Arquivos JavaScript
└── *.html                # Páginas HTML
```

## Configuração do Ambiente de Desenvolvimento

1. Clone o repositório
2. Configure a API de integração (veja o README.md)
3. Use um servidor web local para desenvolvimento (como o módulo http.server do Python)

## Dúvidas?

Se você tiver dúvidas sobre como contribuir, sinta-se à vontade para abrir uma issue perguntando!
