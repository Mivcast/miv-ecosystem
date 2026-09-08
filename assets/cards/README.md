# Card Images

Biblioteca local de imagens dos cards do MIV Ecosystem.

- Formato usado no app: JPG.
- Tamanho recomendado: 500x300 ou outra proporcao 5:3.
- Caminho publico: `assets/cards/<id-do-card>.jpg`.
- Quando trocar uma imagem, mantenha o mesmo nome do arquivo para nao precisar alterar o codigo nem o Supabase.

Depois de publicar novas imagens, execute `SUPABASE_V13_50_CARD_IMAGES.sql` no Supabase para atualizar os cards cadastrados no banco.
