-- MIV Ecosystem V13.24.1 — Correção do modelo Gemini
-- Atualiza a configuração já existente do MARK.IA para o modelo estável atual.

alter table public.mark_ai_settings
  alter column model_name set default 'gemini-3.8-flash';

update public.mark_ai_settings
set model_name = 'gemini-3.8-flash',
    updated_at = now()
where id = 'global'
  and (model_name is null or model_name = '' or model_name = 'gemini-2.5-flash');
