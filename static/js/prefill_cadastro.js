document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);

    const mappings = {
        nome: 'nomeEstabelecimento',
        tipo: 'tipoEstabelecimento',
        endereco: 'endereco',
        email: 'email'
    };

    for (const [paramKey, inputId] of Object.entries(mappings)) {
        const value = params.get(paramKey);
        if (value && document.getElementById(inputId)) {
            document.getElementById(inputId).value = value;
        }
    }
});
