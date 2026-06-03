# Deploy Projecta

## Backend/API

A pasta correta da API e:

```txt
api/
```

Essa pasta contem o `package.json` correto. O arquivo principal de entrada e:

```txt
api/server.js
```

Ele chama:

```js
require("./src/server");
```

O Express real fica em:

```txt
api/src/server.js
```

Esse arquivo cria o app Express, usa `express.json()`, registra as rotas em `app.use("/api", routes)` e escuta em `process.env.PORT || 8600`.

### Instalar dependencias

```bash
cd api
npm install
```

### Rodar localmente

```bash
cd api
npm start
```

Se a porta `8600` ja estiver ocupada na maquina local, rode com uma porta temporaria:

```bash
cd api
PORT=3672 npm start
```

### Testar localmente

```bash
curl http://127.0.0.1:8600/health
curl http://127.0.0.1:8600/api/health
```

Login usa POST:

```bash
curl -X POST http://127.0.0.1:8600/api/login \
  -H "Content-Type: application/json" \
  --data '{"email":"email@exemplo.com","senha":"sua-senha"}'
```

### Variaveis de ambiente da API

Configure estas variaveis na Hostinger Web App Node.js. Nao coloque senhas reais no codigo:

```env
NODE_ENV=production
PORT=8600
BASE_URL=https://projectaempreendimentos.com.br
FRONTEND_URL=https://projectaempreendimentos.com.br
CORS_ORIGINS=https://projectaempreendimentos.com.br
JWT_SECRET=troque-por-um-segredo-grande-e-aleatorio

DB_HOST=host-do-banco
DB_PORT=3306
DB_USER=usuario-do-banco
DB_PASSWORD=senha-do-banco
DB_NAME=nome-do-banco
DB_CONNECTION_LIMIT=10
```

Obrigatorias para iniciar com banco:

```txt
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET em producao
```

### Gerar ZIP correto para Hostinger

O ZIP correto deve abrir assim:

```txt
package.json
package-lock.json
server.js
.env.example
src/
public_html/
```

Nao deve abrir assim:

```txt
api/package.json
api/server.js
```

Crie o ZIP a partir de dentro da pasta `api`.

Se o comando `zip` existir:

```bash
mkdir -p deploy
cd api
zip -r ../deploy/api-hostinger.zip . \
  -x "node_modules/*" ".env" ".env.local" ".env.local.bak" ".env.*.bak" ".git/*" "uploads/*" "tmp/*" "*.log" \
     "src/database/backup.sql" "src/teste.js" "src/uploads/*"
```

Nesta VM, o comando `zip` pode nao existir. Use o Python:

```bash
mkdir -p deploy
python3 - <<'PY'
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path("api")
out = Path("deploy/api-hostinger.zip")
exclude_dirs = {"node_modules", ".git", "uploads", "tmp", "logs", "api"}
exclude_files = {"src/database/backup.sql", "src/teste.js"}

with ZipFile(out, "w", ZIP_DEFLATED) as zf:
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(root).as_posix()
        parts = set(path.relative_to(root).parts)
        if parts & exclude_dirs:
            continue
        if rel in exclude_files or path.name.endswith(".log"):
            continue
        if path.name.startswith(".env") and path.name != ".env.example":
            continue
        zf.write(path, rel)
PY
```

Conferir o ZIP:

```bash
python3 -m zipfile -l deploy/api-hostinger.zip | head -50
```

Ou, se tiver `unzip`:

```bash
unzip -l deploy/api-hostinger.zip | head -50
```

## Hostinger

Use Web App Node.js:

```txt
Framework: Express
Node: 22.x
Diretorio raiz: ./
Comando de instalacao: npm install
Comando de inicio: npm start
Startup file: server.js
```

Passos:

1. Enviar `api-hostinger.zip` na implantacao Node.js.
2. Confirmar que o ZIP abriu com `package.json` na raiz.
3. Configurar as variaveis de ambiente.
4. Rodar/reimplantar para que apareca algo como `added ... packages`.
5. Reiniciar a aplicacao.
6. Verificar logs `stderr.log` e `console.log`.
7. Testar:

```txt
https://projectaempreendimentos.com.br/api/health
https://projectaempreendimentos.com.br/
```

Resposta esperada:

```json
{
  "status": "ok",
  "message": "API online"
}
```

Se `/api/health` retornar `503`, a aplicacao Node nao iniciou ou a Hostinger nao esta apontando para essa implantacao.

Se `/api/health` estiver OK, mas `/` retornar `Cannot GET /`, a API esta online, porem a implantacao ainda nao recebeu o `public_html/` do build do frontend ou ainda esta rodando uma versao antiga do `src/server.js`.

## Frontend

O frontend usa:

```ts
baseURL: import.meta.env.VITE_API_URL || "/api"
```

Em producao:

```env
VITE_API_URL=/api
```

Em desenvolvimento local:

```env
VITE_API_URL=http://127.0.0.1:8600/api
```

Para rebuildar:

```bash
cd front
npm run build
```

Verifique que o build nao aponta para localhost:

```bash
grep -R "127.0.0.1" dist || true
grep -R "8600" dist || true
grep -R "/api/api" dist || true
```

O proxy em `front/vite.config.ts` so funciona em desenvolvimento com `npm run dev`; ele nao existe no build de producao. Em producao, a Hostinger precisa encaminhar `/api` para a Web App Node.js.
