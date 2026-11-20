
import { supabase } from './supabase.js';

const formulario = document.getElementById('cadastro-form');
const feedback = document.getElementById('cadastro-feedback');

formulario.addEventListener('submit', async function(event) {

    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar').value;

    const cep = document.getElementById('cep').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const complemento = document.getElementById('complemento').value.trim();

    if (senha !== confirmar) {

        feedback.textContent = 'As senhas não coincidem. Confira os campos.';
        feedback.className = 'form-feedback error';

        return;
    }

    const botao = formulario.querySelector('.submit-btn');

    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {

        const { data, error } = await supabase.auth.signUp({

            email: email,

            password: senha,

            options: {

                data: {
                    nome: nome,
                    telefone: telefone || null,
                    cep: cep || null,
                    cidade: cidade || null,
                    rua: rua || null,
                    complemento: complemento || null
                }

            }

        });

        if (error) {
            throw error;
        }

        feedback.textContent = data.session
            ? 'Cadastro realizado com sucesso! Sua conta já está conectada.'
            : 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.';

        feedback.className = 'form-feedback success';

        formulario.reset();

    } catch (error) {

        feedback.textContent = 'Não foi possível realizar o cadastro: ' + error.message;
        feedback.className = 'form-feedback error';

    } finally {

        botao.disabled = false;
        botao.innerHTML = 'Criar minha conta <i class="fa-solid fa-arrow-right"></i>';

    }

});


document.getElementById('newsletter-form').addEventListener('submit', function(event) {

    event.preventDefault();

    document.getElementById('newsletter-feedback').textContent =
        'E-mail recebido para demonstração!';

    this.reset();

});
