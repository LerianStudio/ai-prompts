## Descrição

- Atualizar a implementação dos filtros existentes no frontend para ser compatível com o novo sistema de filtragem avançado implementado no backend, que agora suporta múltiplos operadores além de correspondências exatas, para geração de reports.

## Contexto

- O backend foi atualizado para suportar um sistema de filtragem mais robusto com operadores como eq, gte, lte, gt, lt, between, in, nin.

## Operadores disponíveis:

- eq -> equal
- gt → greater than
- gte → greater or equal
- lt → less than
- lte → less or equal
- between
- in
- nin → not in

## Exemplos:

```
{
    "templateId": "{{template_id}}",
    "filters": {
        "midaz_onboarding": {
            "account": {
                "id": {
                    "eq": ["01986d42-df4b-7233-b1b1-39eba87dd965"]
                }
            }
        }
    }
}
```

```
{
    "templateId": "{{template_id}}",
    "filters": {
        "midaz_onboarding": {
            "account": {
                "created_at": {
                    "between": ["2025-08-02", "2025-08-03"]
                }
            }
        }
    }
}
```

```
{
    "templateId": "{{template_id}}",
    "filters": {
        "midaz_onboarding": {
            "account": {
                "alias": {
                    "nin": ["@fee", "@external/BRL"]
                }
            }
        }
    }
}
```

## Critérios de Aceite

- [ ] Manter compatibilidade com filtros existentes sem quebrar funcionalidade.
- [ ] Adaptar estrutura de dados dos filtros para o novo formato do backend.
- [ ] Implementar suporte para novos operadores de filtro na interface.
- [ ] Validar que filtros de intervalo de datas funcionam corretamente.
- [ ] Validar que comparações numéricas (maior que, menor que) funcionam.
- [ ] Validar que filtros baseados em listas (in, nin) funcionam.
- [ ] Garantir que filtros complexos são enviados corretamente para o backend.

## Tarefas Técnicas

- [ ] Analisar a nova estrutura de filtros do backend.
- [ ] Refatorar componentes de filtro para o novo formato.
- [ ] Implementar o mapeamento de operadores no frontend.
- [ ] Atualizar chamadas de API para enviar filtros no formato correto.
- [ ] Adicionar validação de entrada para novos tipos de filtro.
- [ ] Atualizar testes existentes para a nova estrutura.
- [ ] Adicionar testes para os novos operadores.
