# CPPEM Número Seguro

Página antifraude para confirmar se um telefone pertence à equipe CPPEM. O visual reutiliza a identidade escura, dourada, tipografia e assets institucionais do `siteCppemNovo`.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem configuração externa, os três números oficiais informados funcionam como base inicial. Assim que o Notion está configurado, ele se torna a única autoridade da consulta: desmarcar `Ativo` realmente invalida o chip, sem o cadastro local sobrescrever essa decisão.

## Notion — fonte oficial

Foi criada a database `Números Oficiais CPPEM` com estas propriedades:

| Propriedade | Tipo | Uso |
| --- | --- | --- |
| Nome | Title | Identificação do setor ou responsável |
| Número E.164 | Rich text | Somente dígitos, incluindo `55` e DDD |
| Ativo | Checkbox | Somente linhas marcadas são confirmadas pelo site |
| Data de ativação | Date | Controle da entrada do chip |
| Observações | Rich text | Motivo de troca, bloqueio ou informação interna |

Configure `NOTION_TOKEN`, `NOTION_PHONE_DATABASE_ID` e `PHONE_REGISTRY_SOURCE=notion` no ambiente do site. No desenvolvimento local, o token já utilizado por `C:/Projetos/cppem/site-cppem` é reutilizado sem ser copiado ou exposto; em produção, ele deve ser cadastrado como variável de ambiente.

### Trocar um chip

1. Desmarque `Ativo` no número antigo; não apague a linha, para preservar o histórico.
2. Crie uma linha para o chip novo, usando o formato `55 + DDD + número`.
3. Marque `Ativo` apenas quando o canal estiver pronto para atendimento.

## Supabase — alternativa desativada

O projeto preserva suporte opcional ao Supabase e a migração `supabase/001_phone_registry.sql`, mas ele não participa da consulta enquanto `PHONE_REGISTRY_SOURCE=notion`.

## Privacidade e segurança

- Tokens e chaves são lidos apenas no servidor.
- O endpoint não grava o número consultado.
- A consulta é exata e possui limitação básica de tentativas por IP.
- O formulário aceita número com pontuação, com `+55` ou apenas DDD + telefone.
