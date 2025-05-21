document.addEventListener('DOMContentLoaded', function () {
    const quickForm = document.getElementById('quickForm');

    quickForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nomeEstabelecimento').value;
        const tipo = document.getElementById('tipoEstabelecimento').value;
        const endereco = document.getElementById('endereco').value;
        const email = document.getElementById('email').value;

        const params = new URLSearchParams({
            nome,
            tipo,
            endereco,
            email
        });

        window.location.href = `cadastro.html?${params.toString()}`;
    });
});
