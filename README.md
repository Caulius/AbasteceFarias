# Sistema de Gestão de Abastecimento

Um sistema completo para gerenciar abastecimentos de veículos com DIESEL e ARLA, desenvolvido em React com TypeScript e preparado para usar Firebase como backend.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard**: Visão geral com estatísticas e análises
- **Cadastro de Responsáveis**: Gerenciar pessoas responsáveis pelos abastecimentos
- **Cadastro de Veículos**: Gerenciar frota de veículos
- **Registro de Abastecimentos**: Controle detalhado de DIESEL e ARLA
- **Consulta de Abastecimentos**: Busca e filtros avançados
- **Relatórios**: Exportação em PDF, Excel e TXT
- **Armazenamento Local**: Dados salvos no localStorage do navegador

### 🔧 Preparado para Firebase
- Configuração completa do Firebase
- Serviços para todas as operações CRUD
- Hooks personalizados para gerenciamento de estado
- Sistema de migração do localStorage para Firebase

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **jsPDF** para geração de PDFs
- **XLSX** para exportação Excel
- **Firebase** (preparado para uso)
- **Vite** como bundler

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🚀 Como executar

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-gestao-abastecimento
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em modo desenvolvimento**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 🔥 Configuração do Firebase (Opcional)

Para usar o Firebase como backend:

1. **Crie um projeto no Firebase Console**
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Crie um novo projeto
   - Ative o Firestore Database

2. **Configure as credenciais**
   - Edite o arquivo `src/config/firebase.ts`
   - Substitua as configurações pelos dados do seu projeto:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-project-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

3. **Configure as regras do Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todas as coleções (desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. **Migre os dados existentes**
   - Use o serviço `syncService.migrateFromLocalStorage()` para migrar dados do localStorage

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx    # Painel principal
│   ├── FuelForm.tsx     # Formulário de abastecimento
│   ├── FuelList.tsx     # Lista de abastecimentos
│   ├── Reports.tsx      # Relatórios
│   └── ...
├── config/              # Configurações
│   └── firebase.ts      # Configuração Firebase
├── hooks/               # Hooks personalizados
│   ├── useLocalStorage.ts
│   └── useFirebase.ts   # Hooks para Firebase
├── services/            # Serviços
│   └── firebaseService.ts
├── types/               # Definições TypeScript
│   └── index.ts
└── ...
```

## 📊 Funcionalidades Detalhadas

### Dashboard
- Estatísticas gerais de abastecimentos
- Filtros por período (dia atual, mês atual, últimos 90 dias)
- Período personalizado com seletor de calendário (até 90 dias)
- Filtro por modelo de veículo
- Análise comparativa de consumo entre veículos
- Últimos 5 abastecimentos

### Formulário de Abastecimento
- **Campos obrigatórios**: Responsável, Veículo, Tipo de combustível
- **DIESEL**: Hodômetros inicial/final obrigatórios, nível opcional (inicial OU final)
- **ARLA**: Hodômetros inicial/final obrigatórios, nível opcional (inicial OU final)
- Campos opcionais: KM do veículo, média de consumo, observações
- Validações em tempo real

### Relatórios
- **Formatos**: PDF, Excel, TXT
- **Filtros**: Diário, mensal, período personalizado
- **Conteúdo**: Resumo estatístico + detalhamento completo
- Dados organizados e formatados profissionalmente

## 🔄 Migração para Firebase

O sistema está preparado para migrar do localStorage para Firebase:

```typescript
import { syncService } from './services/firebaseService';

// Migrar dados existentes
await syncService.migrateFromLocalStorage();

// Limpar localStorage após migração
syncService.clearLocalStorage();
```

## 🚀 Deploy

O projeto está configurado para deploy no Netlify:

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 📝 Notas de Desenvolvimento

- **Responsividade**: Interface otimizada para desktop e mobile
- **Validações**: Validações robustas em todos os formulários
- **UX/UI**: Design moderno com tema escuro
- **Performance**: Otimizado com lazy loading e memoização
- **Acessibilidade**: Componentes acessíveis com ARIA labels

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório do projeto.