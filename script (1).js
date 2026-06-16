document.addEventListener('DOMContentLoaded', () => {
  
  const authOverlay = document.getElementById('auth-overlay');
  const mainContent = document.getElementById('main-content');
  const authBtn = document.getElementById('auth-btn');
  const toggleAuthLink = document.getElementById('toggle-auth');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  
  //cadastroo
  const nameInput = document.getElementById('auth-name');
  const addressInput = document.getElementById('auth-address');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const errorDisplay = document.getElementById('auth-error-msg');

  const registerFields = document.querySelectorAll('.register-only');

  let isLoginMode = true;

  //verifica erro
  if (!localStorage.getItem('usersDB')) {
    localStorage.setItem('usersDB', JSON.stringify([]));
  }

  function showFeedbackMessage(message, type = 'error') {
    errorDisplay.innerText = message;
    errorDisplay.style.display = 'block';
    
    if (type === 'success') {
      errorDisplay.style.background = 'rgba(34, 137, 95, 0.1)';
      errorDisplay.style.borderColor = 'rgba(34, 137, 95, 0.3)';
      errorDisplay.style.color = '#5FF3B9';
    } else {
      errorDisplay.style.background = 'rgba(232, 74, 59, 0.1)';
      errorDisplay.style.borderColor = 'rgba(232, 74, 59, 0.2)';
      errorDisplay.style.color = '#FF6B5B';
    }
  }

  function clearFeedback() {
    errorDisplay.style.display = 'none';
    nameInput.classList.remove('input-error');
    addressInput.classList.remove('input-error');
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
  }

  [nameInput, addressInput, emailInput, passwordInput].forEach(input => {
    if(input) input.addEventListener('input', clearFeedback);
  });

  //botao login/cadastro
  if (toggleAuthLink) {
    toggleAuthLink.addEventListener('click', (e) => {
      e.preventDefault();
      isLoginMode = !isLoginMode;
      clearFeedback();

      if (isLoginMode) {
        authTitle.innerText = 'Entrar na Plataforma';
        authSubtitle.innerText = 'Acesse para interagir e filtrar o conteúdo comercial.';
        authBtn.innerText = 'Acessar Conta';
        toggleAuthLink.innerHTML = 'Não possui cadastro? <span>Cadastre-se aqui</span>';
        registerFields.forEach(f => f.style.display = 'none');
      } else {
        authTitle.innerText = 'Criar Nova Conta';
        authSubtitle.innerText = 'Insira seus dados hiperlocais para liberar os filtros do portal.';
        authBtn.innerText = 'Confirmar Meu Cadastro';
        toggleAuthLink.innerHTML = 'Já é cadastrado? <span>Acesse aqui</span>';
        registerFields.forEach(f => f.style.display = 'block');
      }
    });
  }

  //validacao e gps
  function processAuthentication() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    //email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      emailInput.classList.add('input-error');
      showFeedbackMessage('Por favor, digite um formato de e-mail válido (Ex: nome@provedor.com).');
      return;
    }

    //senha
    if (password.length < 6 || password.length > 20) {
      passwordInput.classList.add('input-error');
      showFeedbackMessage('A senha digitada incorretamente. Ela precisa conter entre 6 e 20 caracteres.');
      return;
    }

    let registeredUsers = JSON.parse(localStorage.getItem('usersDB'));

    if (!isLoginMode) {
      //cadastro
      const name = nameInput.value.trim();
      const address = addressInput.value.trim();

      //nome
      if (!name) {
        nameInput.classList.add('input-error');
        showFeedbackMessage('Aviso: O preenchimento do Nome Completo é obrigatório para o cadastro.');
        return;
      }

      //endereco
      if (!address) {
        addressInput.classList.add('input-error');
        showFeedbackMessage('Aviso: O preenchimento do seu Endereço é obrigatório.');
        return;
      }

      const userExists = registeredUsers.some(user => user.email === email);
      if (userExists) {
        showFeedbackMessage('Este e-mail já possui um cadastro existente.');
        return;
      }

      //autorizacao de loc
      if (!navigator.geolocation) {
        showFeedbackMessage('Erro técnico: Seu navegador não suporta solicitações de geolocalização.');
        return;
      }

      showFeedbackMessage('Solicitando autorização de GPS... Por favor, permita o acesso na janela pop-up.', 'success');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          //permissao top
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          //salvar tudo
          registeredUsers.push({
            name: name,
            address: address,
            email: email,
            password: password,
            latitude: lat,
            longitude: lon
          });
          
          localStorage.setItem('usersDB', JSON.stringify(registeredUsers));
          
          //tela de login dai
          isLoginMode = true;
          authTitle.innerText = 'Entrar na Plataforma';
          authSubtitle.innerText = 'Cadastro validado! Entre na sua conta agora.';
          authBtn.innerText = 'Acessar Conta';
          toggleAuthLink.innerHTML = 'Não possui cadastro? <span>Cadastre-se aqui</span>';
          registerFields.forEach(f => f.style.display = 'none');
          
          passwordInput.value = '';
          showFeedbackMessage('Cadastro validado com localização segura! Insira sua senha para entrar.', 'success');
        },
        (error) => {
          //permissao recusada
          showFeedbackMessage('Cadastro Negado: É obrigatório conceder permissão de localização (GPS) para se registrar nesta rede hiperlocal.');
        }
      );

    } else {
      //loginnnnnnn
      const emailFound = registeredUsers.some(user => user.email === email);
      
      if (!emailFound) {
        emailInput.classList.add('input-error');
        showFeedbackMessage('Aviso: Este usuário não tem cadastro. Mude para a aba "Cadastre-se aqui" abaixo para criar seu perfil.');
        return;
      }

      const exactMatch = registeredUsers.find(user => user.email === email && user.password === password);
      
      if (!exactMatch) {
        passwordInput.classList.add('input-error');
        showFeedbackMessage('Aviso: A senha digitada não está correta. Verifique seus dados e tente novamente.');
        return;
      }

      //transicao para menu
      authOverlay.style.opacity = '0';
      authOverlay.style.visibility = 'hidden';
      
      mainContent.style.display = 'block';
      setTimeout(() => {
        mainContent.style.opacity = '1';
        window.scrollTo(0, 0);
      }, 50);
    }
  }

  if (authBtn) {
    authBtn.addEventListener('click', processAuthentication);
  }

  //categorias
  const filterChips = document.querySelectorAll('.filter-chip');
  const feedCards = document.querySelectorAll('.feed-card');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterValue = chip.getAttribute('data-filter');

      feedCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || filterValue === cardCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});