// Arquivo JavaScript principal para o site "Aqui aceita Bitcoin?"

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do site
    console.log('Site "Aqui aceita Bitcoin?" carregado com sucesso!');
    
    // Formulário de cadastro rápido
    const quickForm = document.getElementById('quickForm');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            // Não é necessário prevenir o comportamento padrão,
            // pois queremos que o formulário redirecione para cadastro.html
            
            // Podemos adicionar validação adicional aqui se necessário
            console.log('Formulário enviado com sucesso!');
            
            // Armazenar dados no localStorage para recuperar na página de cadastro
            const nomeEstabelecimento = document.getElementById('nomeEstabelecimento').value;
            const tipoEstabelecimento = document.getElementById('tipoEstabelecimento').value;
            const endereco = document.getElementById('endereco').value;
            const email = document.getElementById('email').value;
            
            localStorage.setItem('nomeEstabelecimento', nomeEstabelecimento);
            localStorage.setItem('tipoEstabelecimento', tipoEstabelecimento);
            localStorage.setItem('endereco', endereco);
            localStorage.setItem('email', email);
        });
    }
    
    // Recuperar dados do localStorage na página de cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        const nomeEstabelecimento = localStorage.getItem('nomeEstabelecimento');
        const tipoEstabelecimento = localStorage.getItem('tipoEstabelecimento');
        const endereco = localStorage.getItem('endereco');
        const email = localStorage.getItem('email');
        
        if (nomeEstabelecimento) {
            document.getElementById('nomeEstabelecimento').value = nomeEstabelecimento;
        }
        
        if (tipoEstabelecimento) {
            document.getElementById('tipoEstabelecimento').value = tipoEstabelecimento;
        }
        
        if (endereco) {
            document.getElementById('endereco').value = endereco;
        }
        
        if (email) {
            document.getElementById('email').value = email;
        }
        
        // Limpar localStorage após recuperar os dados
        localStorage.removeItem('nomeEstabelecimento');
        localStorage.removeItem('tipoEstabelecimento');
        localStorage.removeItem('endereco');
        localStorage.removeItem('email');
    }
    
    // Inicializar data atual para o campo de verificação
    const checkDateField = document.getElementById('checkDate');
    if (checkDateField) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        checkDateField.value = `${year}-${month}-${day}`;
    }
    
    // Função para mostrar/esconder seções do formulário de cadastro
    const showFormStep = (stepNumber) => {
        const formSteps = document.querySelectorAll('.form-step');
        formSteps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });
        
        // Atualizar indicadores de progresso
        const stepIndicators = document.querySelectorAll('.step-indicator');
        stepIndicators.forEach((indicator, index) => {
            if (index + 1 === stepNumber) {
                indicator.classList.add('active');
            } else if (index + 1 < stepNumber) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
    };
    
    // Configurar botões de navegação do formulário
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-current-step'));
            const nextStep = currentStep + 1;
            showFormStep(nextStep);
            window.scrollTo(0, 0);
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-current-step'));
            const prevStep = currentStep - 1;
            showFormStep(prevStep);
            window.scrollTo(0, 0);
        });
    });
    
    // Inicializar primeira etapa do formulário se estivermos na página de cadastro
    if (document.querySelector('.form-step')) {
        showFormStep(1);
    }
    
    // Esconder o contador de estabelecimentos do BTC Map
    // Isso é feito via CSS com display: none !important
});
