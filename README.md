# session-sounds

Um mod para o Claude Code (inclusive a aba Code do aplicativo de desktop do Claude) que avisa com som quando a sessão precisa de você:

- **Ding**: a sessão terminou o turno e está esperando um novo comando. Não toca quando você mesmo interrompe o turno, nem quando um subagente termina.
- **Telefone de escritório** (um toque): o Claude precisa da sua intervenção no meio da tarefa, seja num cartão de permissão ou numa pergunta (AskUserQuestion).

Os dois sons ficam em `sounds/` (`ding.wav` e `phone.wav`) e podem ser trocados por qualquer WAV com o mesmo nome. No Windows o som é tocado pelo PowerShell (`System.Media.SoundPlayer`); no macOS, pelo reprodutor do próprio Claude Code.

## Instalação

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install session-sounds --marketplace SpyCopBR/session-sounds
```

Ou de um shell:

```bash
claude plugin install session-sounds --marketplace SpyCopBR/session-sounds
```

Responda `y` para adicionar o marketplace e escolha o escopo do usuário (user) para que o mod funcione em todas as sessões.

No aplicativo de desktop, onde `/plugin` não funciona: clique em **+** ao lado da caixa de prompt, depois em **Plugins**, **Add marketplace** com `SpyCopBR/session-sounds` e então **Add plugin**.

## Licença

MIT
