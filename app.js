// Market Helper - Aplicação Principal
import { 
    supabase, 
    loginWithGoogle, 
    loginWithEmail, 
    signUpWithEmail,
    logout,
    getCurrentUser,
    isAuthenticated,
    criarLista,
    listarListas,
    obterLista,
    atualizarLista,
    deletarLista,
    adicionarProduto,
    atualizarProduto,
    deletarProduto,
    marcarProdutoComprado
} from './src/supabase.js';

// ===== ESTADO DA APLICAÇÃO =====
const appState = {
    user: null,
    listas: [],
    listaAtual: null,
    loading: false
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Market Helper v2.0 iniciando...');
    
    // Verificar autenticação
    const user = await getCurrentUser();
    
    if (user) {
        appState.user = user;
        mostrarTela('tela-menu');
        carregarDadosIniciais();
    } else {
        mostrarTela('tela-auth');
    }
    
    // Ocultar loading
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Event listeners
    setupEventListeners();
    
    console.log('✅ Market Helper carregado!');
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Tabs de autenticação
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Forms de autenticação
    document.getElementById('form-login')?.addEventListener('submit', handleLogin);
    document.getElementById('form-cadastro')?.addEventListener('submit', handleSignup);
    
    // Botões Google
    document.getElementById('btn-google-login')?.addEventListener('click', handleGoogleLogin);
    document.getElementById('btn-google-cadastro')?.addEventListener('click', handleGoogleLogin);
    
    // Botões do menu
    document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-nova-lista')?.addEventListener('click', () => mostrarCriarLista());
    document.getElementById('btn-minhas-listas')?.addEventListener('click', () => mostrarMinhasListas());
    document.getElementById('btn-mercado')?.addEventListener('click', () => mostrarCalculadora());
    document.getElementById('btn-estatisticas')?.addEventListener('click', () => mostrarEstatisticas());
}

// ===== AUTENTICAÇÃO =====
function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.tab === tabName);
    });
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('ativo', content.id === `tab-${tabName}`);
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    showLoading(true);
    
    const { success, error } = await loginWithEmail(email, senha);
    
    showLoading(false);
    
    if (success) {
        showToast('Login realizado com sucesso!', 'success');
        appState.user = await getCurrentUser();
        mostrarTela('tela-menu');
        carregarDadosIniciais();
    } else {
        showToast(error.message || 'Erro ao fazer login', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    
    if (senha.length < 6) {
        showToast('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    showLoading(true);
    
    const { success, error } = await signUpWithEmail(email, senha, nome);
    
    showLoading(false);
    
    if (success) {
        showToast('Conta criada com sucesso!', 'success');
        appState.user = await getCurrentUser();
        mostrarTela('tela-menu');
        carregarDadosIniciais();
    } else {
        showToast(error.message || 'Erro ao criar conta', 'error');
    }
}

async function handleGoogleLogin() {
    showLoading(true);
    const { success, error } = await loginWithGoogle();
    showLoading(false);
    
    if (!success && error) {
        showToast(error.message || 'Erro ao fazer login com Google', 'error');
    }
}

async function handleLogout() {
    const confirmar = confirm('Deseja realmente sair?');
    
    if (!confirmar) return;
    
    showLoading(true);
    await logout();
    showLoading(false);
    
    appState.user = null;
    appState.listas = [];
    appState.listaAtual = null;
    
    mostrarTela('tela-auth');
    showToast('Logout realizado com sucesso', 'info');
}

// ===== DADOS INICIAIS =====
async function carregarDadosIniciais() {
    // Atualizar mensagem de boas-vindas
    if (appState.user) {
        const nome = appState.user.user_metadata?.nome || appState.user.email?.split('@')[0] || 'Usuário';
        document.getElementById('welcome-message').textContent = `Olá, ${nome}! 👋`;
    }
    
    // Carregar listas
    await carregarListas();
}

async function carregarListas() {
    showLoading(true);
    
    const { success, data, error } = await listarListas();
    
    showLoading(false);
    
    if (success) {
        appState.listas = data;
        renderizarListasRecentes();
    } else {
        console.error('Erro ao carregar listas:', error);
        showToast('Erro ao carregar listas', 'error');
    }
}

// ===== RENDERIZAÇÃO =====
function renderizarListasRecentes() {
    const container = document.getElementById('lista-recentes');
    
    if (!container) return;
    
    if (appState.listas.length === 0) {
        container.innerHTML = '<p class="empty-state">Você ainda não tem listas. Crie sua primeira!</p>';
        return;
    }
    
    const listasRecentes = appState.listas.slice(0, 5);
    
    container.innerHTML = listasRecentes.map(lista => `
        <div class="list-item" onclick="abrirLista('${lista.id}')">
            <div class="list-info">
                <h4>${lista.nome}</h4>
                <p>${lista.produtos?.length || 0} produtos • ${formatarData(lista.created_at)}</p>
            </div>
            <div class="list-stats">
                <div class="stat">
                    <div class="stat-value">R$ ${formatarMoeda(lista.total_gasto || 0)}</div>
                    <div class="stat-label">Gasto</div>
                </div>
                <div class="stat">
                    <div class="stat-value">R$ ${formatarMoeda(lista.orcamento || 0)}</div>
                    <div class="stat-label">Orçamento</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== NAVEGAÇÃO =====
function mostrarTela(idTela) {
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('ativa');
    });
    
    document.getElementById(idTela)?.classList.add('ativa');
}

function mostrarCriarLista() {
    showToast('Funcionalidade em desenvolvimento', 'info');
    // TODO: Implementar tela de criar lista
}

function mostrarMinhasListas() {
    showToast('Funcionalidade em desenvolvimento', 'info');
    // TODO: Implementar tela de minhas listas
}

function mostrarCalculadora() {
    showToast('Funcionalidade em desenvolvimento', 'info');
    // TODO: Implementar calculadora
}

function mostrarEstatisticas() {
    showToast('Funcionalidade em desenvolvimento', 'info');
    // TODO: Implementar estatísticas
}

function abrirLista(listaId) {
    showToast('Funcionalidade em desenvolvimento', 'info');
    // TODO: Implementar visualização de lista
}

// ===== UTILITÁRIOS =====
function showLoading(show) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function formatarMoeda(valor) {
    return (valor || 0).toFixed(2).replace('.', ',');
}

function formatarData(data) {
    const date = new Date(data);
    const hoje = new Date();
    const diff = Math.floor((hoje - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `${diff} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ===== LISTENER DE AUTENTICAÇÃO =====
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
        appState.user = session.user;
        mostrarTela('tela-menu');
        carregarDadosIniciais();
    }
    
    if (event === 'SIGNED_OUT') {
        appState.user = null;
        mostrarTela('tela-auth');
    }
});

console.log('✅ App.js carregado!');
