# Como gerar o APK do páginas v0.9 (sem instalar nada no computador)

Você vai usar o **GitHub**, que compila o app na nuvem. Leva uns 20 minutos na primeira vez e é grátis.

## Parte 1 — Criar a conta e o espaço do projeto (só uma vez)
1. Entre em **github.com** e crie uma conta (botão *Sign up*).
2. Clique no **+** no canto superior direito e escolha **New repository**.
3. Em *Repository name* escreva `paginas-app`. Pode deixar **Private**. Clique em **Create repository**.

## Parte 2 — Enviar os arquivos
4. Descompacte este zip no seu computador.
5. Na página do repositório vazio, clique em **uploading an existing file**.
6. Arraste para lá TUDO o que está dentro da pasta: as pastas `www` e `assets` e os arquivos `package.json`, `capacitor.config.json`, `debug.keystore` e `build-apk.yml`. (Se aparecer uma pasta oculta `.github`, não precisa levar: o próximo passo cria ela.) Clique em **Commit changes**.
7. Crie o arquivo que manda o GitHub compilar:
   - Clique em **Add file → Create new file**.
   - No campo do nome, escreva exatamente: `.github/workflows/build-apk.yml` (ao digitar as barras, o GitHub cria as pastas).
   - Abra o arquivo `build-apk.yml` do zip no VS Code, copie tudo (Ctrl+A, Ctrl+C) e cole na caixa grande do GitHub.
   - Clique em **Commit changes**.

## Parte 3 — Baixar o APK
8. Clique na aba **Actions**. Se pedir, clique em **I understand my workflows, go ahead and enable them**.
9. Abra a execução chamada **Gerar APK**. Bolinha amarela = compilando (uns 6 a 10 minutos). Quando ficar verde ✓, terminou. Se não começar sozinha: **Gerar APK → Run workflow**.
10. Dentro da execução, role até **Artifacts** e clique em **paginas-apk**. Vai baixar um zip; descompacte e você terá o `app-debug.apk`.

## Parte 4 — Instalar no Android
11. Mande o `app-debug.apk` para o celular (WhatsApp para você mesma, Google Drive, e-mail ou cabo USB).
12. Toque no arquivo. O Android vai pedir para permitir **instalar apps desconhecidos** para o aplicativo que você usou para abrir o arquivo: libere. Se aparecer aviso do Play Protect, toque em **Instalar mesmo assim**.
13. Abra o **páginas**. Em *Perfil → Configurações → Notificações*, ligue o lembrete e permita as notificações.

## Para atualizar o app depois
1. No GitHub, abra a pasta **www**.
2. Clique em **Add file → Upload files** e arraste o `index.html` novo (ele substitui o antigo). Clique em **Commit changes**.
3. A aba **Actions** compila de novo sozinha. Baixe o novo APK como na Parte 3 e instale **por cima**: seus livros e dados continuam lá (o pacote usa sempre a mesma chave de assinatura).
4. Por segurança, antes de atualizar use *Configurações → Seus dados → Exportar*.

## Se algo der errado
- **Bolinha vermelha ✗ na aba Actions:** abra a execução, clique no passo marcado em vermelho e copie as últimas linhas da mensagem. Me envie que eu corrijo.
- **O ícone ficou o padrão:** o passo de ícones é opcional e pode falhar sem impedir o APK. Me avise e eu ajusto.
- **“App não instalado”:** se já tinha uma versão instalada de outra origem, desinstale e instale de novo (exporte os dados antes).

## Alternativa: compilar no seu computador
Instale Node.js 20, Java 21 e Android Studio. Na pasta do projeto rode `npm install`, `npx cap add android`, `npx cap sync android` e `npx cap open android`. No Android Studio use *Build → Build APK(s)*. Para as notificações funcionarem, adicione a permissão `POST_NOTIFICATIONS` ao `AndroidManifest.xml`.

## O que tem nesta versão (v0.9)
- Estante modular: móvel com prateleiras, arrastar e soltar, decoração que se conquista, modelos, lombadas coloridas, ordem arco-íris, pilha deitada.
- Metas por ano com releituras, folga que protege a sequência, registro retroativo, lixeira com desfazer, rascunhos automáticos, status “abandonado” e texto ajustável.
- Lembretes de leitura agendados no aparelho (chegam com o app fechado).

## Observações
- É um APK de teste (debug), ótimo para você e sua namorada usarem. Para publicar na Play Store será preciso gerar uma versão assinada com chave própria.
- Os dados ficam só no aparelho de cada pessoa.
