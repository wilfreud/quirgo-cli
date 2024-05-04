## Todo

- Replace OctokitResponse<any> by proper typing!
- Consider writing tests (unit tests)
- Add a mini logger lib file
- Handle verbose properly

## From feedback

- [x] use more branches (e.g. `main`, `develop`, `feature/...`, `bugfix/...`), most of them will be temporary till reviewing process
- [x] see if owner can be retrieved from GitHub access token, use default as username
- [x] better README
- [ ] donner plus d'infos pour l'access token, permettre d'obtenir un lien pour le générer avec peut-etre en query params de quoi remplir le formulaire avec le minimum requis pour l'access token
- [x] preciser les permissions accordees a quirgo sont les permissions minimales requises
- [ ] donner la possibilite de stocker le token, voire meme plusieurs
- [x] set verbose to false at default in configuration
- [x] mutual exclusion for options --json && --env
- [ ] better error handling
