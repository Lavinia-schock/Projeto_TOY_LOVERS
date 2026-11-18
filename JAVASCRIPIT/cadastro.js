document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;
  const feedback = document.getElementById('cadastro-feedback');
  if (senha !== confirmar) { feedback.textContent = 'As senhas não coincidem. Confira os campos.'; feedback.className = 'form-feedback error'; return; }
  feedback.textContent = 'Formulário validado! O cadastro ainda não é salvo, pois esta versão não possui banco de dados.';
  feedback.className = 'form-feedback success';
  this.reset();
});
document.getElementById('newsletter-form').addEventListener('submit', function(event) {
  event.preventDefault(); document.getElementById('newsletter-feedback').textContent = 'E-mail recebido para demonstração!';
  this.reset();
});