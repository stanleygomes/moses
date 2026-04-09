# Changelog

## [1.3.1](https://github.com/stanleygomes/moses-cli/compare/moses-cli-v1.3.0...moses-cli-v1.3.1) (2026-04-09)


### Code Refactoring

* update context loading to include base-prompt, disable model selection, and enforce Portuguese responses ([f7fed1c](https://github.com/stanleygomes/moses-cli/commit/f7fed1c366e6a611b4a8152a7f7288ba763cb960))

## [1.3.0](https://github.com/stanleygomes/moses-cli/compare/moses-cli-v1.2.0...moses-cli-v1.3.0) (2026-04-09)


### Features

* add instruction files support for AI reviews and introduce config skills command to manage them ([b28e147](https://github.com/stanleygomes/moses-cli/commit/b28e147d90215a1afc9e11dc6b2ce3356fd0944c))
* implement dynamic model selection and support for per-review model overrides via CLI or interactive wizard ([3556dbc](https://github.com/stanleygomes/moses-cli/commit/3556dbcd5a20318023f40f4499c7909d6be45f96))


### Code Refactoring

* centralize GitLab configuration updates and remove redundant wizard and error handling logic ([33ba646](https://github.com/stanleygomes/moses-cli/commit/33ba646fd31472fa0a82aceb8f5f16dc4dc53e35))
* consolidate AI services into a single AiService module and define unified configuration types ([891e854](https://github.com/stanleygomes/moses-cli/commit/891e8549a23e32808ef7df6fdcd3190d92f9c1e0))
* consolidate configuration updates into ConfigUpdateService and unify error handling with ErrorUtil while enhancing TokenUtil masking capabilities. ([0c4cfcc](https://github.com/stanleygomes/moses-cli/commit/0c4cfccd6e6d4521fa076d36f2a2e58202001271))
* flatten gitlab service directory structure and introduce SetupWizardFlow service ([3fb6aaa](https://github.com/stanleygomes/moses-cli/commit/3fb6aaaf221f929547e226e0bf6dae9f6c8aa716))
* inline DiffLimitManager logic into SetDiffLimitModule and remove unused service files ([0ab564b](https://github.com/stanleygomes/moses-cli/commit/0ab564b36f59eacfd6cf7403cf287d453023672f))
* inline wizard flow logic into InitModule and remove SetupWizardFlow service ([7a3e742](https://github.com/stanleygomes/moses-cli/commit/7a3e742132d123398b838dbb6f6026be56fad891))
* migrate services to utilities and define BuildMergeRequestMarkdownInput type ([63d21b7](https://github.com/stanleygomes/moses-cli/commit/63d21b754c6c6a04bb4ec398b569207c0ac48851))
* modularize GitLab API client and extract HTTP/async utilities ([afd4911](https://github.com/stanleygomes/moses-cli/commit/afd4911bc798a7fef0caaecb99070f9b1d3c10b1))
* remove interactive prompt for automatic repository downloads ([9ff0467](https://github.com/stanleygomes/moses-cli/commit/9ff04673050ae0aae39da91ede8ed0aac72c0a42))
* remove redundant JSDoc comments and improve code formatting across utility and service modules ([6b38eca](https://github.com/stanleygomes/moses-cli/commit/6b38eca53cf61c516874f0328c059857d3bb2d19))
* remove update functionality and cleanup codebase ([749d383](https://github.com/stanleygomes/moses-cli/commit/749d38345cbd504eaae0a9c3e0bef7ffa8c0c9c2))
* rename config services, remove ConfigValidator, and integrate ConfigStore directly into ValidateModule ([1204f99](https://github.com/stanleygomes/moses-cli/commit/1204f992399b553e3f751390a06e79f0a86cc0ed))
* rename Display class to DisplayUtil throughout the codebase ([5415d88](https://github.com/stanleygomes/moses-cli/commit/5415d881874582cd6cc9a9cb66abed4deff6c6f0))
* replace RepoScanner service with RepoUtil and migrate usage limit logic to utility module ([24fb5e4](https://github.com/stanleygomes/moses-cli/commit/24fb5e48f13c7157d987638d862aa6abafdb2026))

## [1.2.0](https://github.com/stanleygomes/moses-cli/compare/moses-cli-v1.1.0...moses-cli-v1.2.0) (2026-04-08)


### Features

* add reset command to clear local configuration and update build output paths ([49b5336](https://github.com/stanleygomes/moses-cli/commit/49b53363227c493d06d65f383c744ae46009588d))
* implement automatic repository context scanning and cloning for improved AI review analysis ([a50a166](https://github.com/stanleygomes/moses-cli/commit/a50a166587339ba6628cad6c6444a08359d0c6a9))
* implement automatic update checking and manual update command for CLI ([6369138](https://github.com/stanleygomes/moses-cli/commit/63691389cafe468d0b388750ce886b48c418f447))


### Bug Fixes

* corrigir permissoes release ci ([d034701](https://github.com/stanleygomes/moses-cli/commit/d034701efe787606b0a06e9c6b08531962ceaefd))
* suppress ENOENT error logs and provide helpful initialization prompts in service error handlers ([83e6da2](https://github.com/stanleygomes/moses-cli/commit/83e6da2cd203d6182f2b2d52322c95136a254b79))


### Miscellaneous Chores

* add prettier ignore ([1f73b8f](https://github.com/stanleygomes/moses-cli/commit/1f73b8f030e34f860d7ff4de04807626bf54f2ba))
* services to extract shared logic into reusable utils ([#9](https://github.com/stanleygomes/moses-cli/issues/9)) ([452c79d](https://github.com/stanleygomes/moses-cli/commit/452c79d12667054ba21b450a2b3a1802f3177071))
* tentando gerar release ([9ec24ea](https://github.com/stanleygomes/moses-cli/commit/9ec24ea21742857e8ec243b688b8d8d0259088b1))
* teste ci ([edc0f16](https://github.com/stanleygomes/moses-cli/commit/edc0f164370c88fedd065c854ba197e210330913))
* teste ci ([ea0d5e9](https://github.com/stanleygomes/moses-cli/commit/ea0d5e976e57b14d0bd3f0d48ae2b27c13089734))
* update description ([cc8fa5a](https://github.com/stanleygomes/moses-cli/commit/cc8fa5aed9e29e5b35b120e69d98978b1df30393))


### Code Refactoring

* abstract prompt logic into a reusable utility with Zod validation and remove redundant config loader module ([aa6fbca](https://github.com/stanleygomes/moses-cli/commit/aa6fbcabd1896ff86bcf7bdafeaf24691d8e212b))
* consolidate configuration management into ConfigStore and standardize prompt usage with a new Confirm utility ([2549ed7](https://github.com/stanleygomes/moses-cli/commit/2549ed75eb4e4a7b9eeeaee0727631e723dc423d))
* enforce class-based architecture across commands and services ([95a8947](https://github.com/stanleygomes/moses-cli/commit/95a894794f973fe4217a57b64cf87c874b8a2276))
* enhance CLI output by migrating MR and context summaries to formatted box displays ([86c575d](https://github.com/stanleygomes/moses-cli/commit/86c575d00b0d1ed1850b7450032cfe326678b782))
* enhance repository context tracking, reduce default diff limit, and improve error handling in service managers ([1543dc8](https://github.com/stanleygomes/moses-cli/commit/1543dc823d1eb47d4622353f444aeedf45929afc))
* flatten module directory structure by moving files directly into the modules directory ([c9e2458](https://github.com/stanleygomes/moses-cli/commit/c9e2458654c46c27a6e1a9d6aa33bf44b518efc7))
* migrate module handlers to centralized services directory ([4972c40](https://github.com/stanleygomes/moses-cli/commit/4972c40d4a03a8b063dacc91e849b0ed3ef35d42))
* modularize CLI command structure and standardize type naming conventions ([63eeeab](https://github.com/stanleygomes/moses-cli/commit/63eeeab3f16a4ff0031305b31ee01a9b0ef38c35))
* modularize constants by splitting src/constants.ts into a dedicated directory ([5a570fe](https://github.com/stanleygomes/moses-cli/commit/5a570fe375dd1130b78cb078b790be1d2fa5b5a3))
* modularize core logic by extracting helper handlers and cleaning up redundant utilities ([134b5a7](https://github.com/stanleygomes/moses-cli/commit/134b5a7d9b88d15faaa9681eb89e4dafa6726069))
* modularize filesystem and JSON operations, and introduce a centralized ConfigStore for improved state management ([5a44f25](https://github.com/stanleygomes/moses-cli/commit/5a44f2572f7daeccbde5f45c670420b8a72f7da9))
* move FEEDBACK_STYLE_GUIDANCE to constants file for better maintainability ([82d2dce](https://github.com/stanleygomes/moses-cli/commit/82d2dcee21fd371f4120d89cb928a53ef26b700a))
* rename service handlers to managers and consolidate setup wizard logic ([3098cfa](https://github.com/stanleygomes/moses-cli/commit/3098cfa6f8149f6b58a6a8debe27559e0d6f7efa))
* src/services into single-responsibility methods and split orchestration flows ([4b1dce4](https://github.com/stanleygomes/moses-cli/commit/4b1dce44106d80b1fd216501c6e52bc2c780ffde))


### Documentation

* ajuste readme ([86595b4](https://github.com/stanleygomes/moses-cli/commit/86595b4f993b087352a923f391a06e527052a14f))
* ajustes no readme ([be1d35e](https://github.com/stanleygomes/moses-cli/commit/be1d35e3b66428337d5d0a2a2343586fa890a27f))
* corrigindo commandos readme ([bf803ee](https://github.com/stanleygomes/moses-cli/commit/bf803ee28d6d2739308f7c23948d5e5ad54cf5fd))
* update README with command reference, improved flow documentation, and feature clarifications ([b4bcfdc](https://github.com/stanleygomes/moses-cli/commit/b4bcfdcddc3f0ff9c38ce4cb0c1c9ad2fdcdb848))

## [1.1.0](https://github.com/stanleygomes/moses-cli/compare/moses-cli-v1.0.0...moses-cli-v1.1.0) (2026-04-03)


### Features

* migrate CLI codebase to TypeScript and add build/lint/format/type-check toolchain ([6aa5f05](https://github.com/stanleygomes/moses-cli/commit/6aa5f05e1b02ea7c23a685a5751ca58bb67034ab))
* refactor MR review flow to Copilot/Gemini-only with contextual prompting and configurable feedback/size guards ([4a7c0ac](https://github.com/stanleygomes/moses-cli/commit/4a7c0acdaebf4335fde8316225ecc94cc0cc8a24))
* translate Portuguese CLI texts to English ([81ac127](https://github.com/stanleygomes/moses-cli/commit/81ac127b6ed8bd56bbf4704dc32a2495fd419e2f))


### Bug Fixes

* comand format check ([e12d3f9](https://github.com/stanleygomes/moses-cli/commit/e12d3f99957b4026ebb162dbb1ec65df8f3516cc))


### Miscellaneous Chores

* add .nomrc file for npm registry configuration ([08b1546](https://github.com/stanleygomes/moses-cli/commit/08b15468132ff2be7de0e4a4337f0071fd1ef8dd))
* add base workflows ([dfd4ff1](https://github.com/stanleygomes/moses-cli/commit/dfd4ff1c3b876e5fb0a84a7c829d888241f09470))
* add husky ([c24af52](https://github.com/stanleygomes/moses-cli/commit/c24af52f796c300887c63758b0ac0deda96ba993))
* add npm publish ([023f4cd](https://github.com/stanleygomes/moses-cli/commit/023f4cdc1e5400bbd4635ad68c2f1fdf5e7769ff))
* adicionando arquivos ([8aad611](https://github.com/stanleygomes/moses-cli/commit/8aad61145de1396c6e415663ae9e5543d522784d))
* ajustando package.json ([fad0a19](https://github.com/stanleygomes/moses-cli/commit/fad0a19d833bebe7fc47e306166c7269e639338b))
* ajustes na geracao do resultado do prompt ([02dcffd](https://github.com/stanleygomes/moses-cli/commit/02dcffd9320d9e96cdb789add29ed3359d3f0e30))
* corrigindo constantes ([3c53908](https://github.com/stanleygomes/moses-cli/commit/3c539084e857285195eba26cada07bd61432c777))
* corrigir publish npm ([ceb2027](https://github.com/stanleygomes/moses-cli/commit/ceb2027eb991239ccee7f0c2a3a74b8c3244a822))
* mostrar arquivos de contexto ([1453217](https://github.com/stanleygomes/moses-cli/commit/14532177d64bddfad77caff8f43f749576914182))
* mudando para pnpm e corrigir husky ([c4b1ca5](https://github.com/stanleygomes/moses-cli/commit/c4b1ca5e496d97e7f52fa27ec9c45f2cb3c6ca76))
* organizando o codigo ([6ca4d38](https://github.com/stanleygomes/moses-cli/commit/6ca4d3874f7a6b1b92676ac9e00baf0c67cb718c))
* projeto base ([2a52608](https://github.com/stanleygomes/moses-cli/commit/2a52608f7f4cc4674726777e58b7cb2662aa663b))
* refatorando arquivos ([3b33f7a](https://github.com/stanleygomes/moses-cli/commit/3b33f7ad14a9abe95ef186e2debad5752f156f8a))
* refatorando codigo e documentando comandos ([12180cd](https://github.com/stanleygomes/moses-cli/commit/12180cd90e1e459dce17666868e65eafec1f25f6))
* screenshot ([d644a3a](https://github.com/stanleygomes/moses-cli/commit/d644a3a27cc38f2730f42d06b83240ed1ae60c5a))
* usar static import ([7a0334c](https://github.com/stanleygomes/moses-cli/commit/7a0334c64909ab2587b115cb265abcead89cfca6))
* validar commits workflow ([e0175cb](https://github.com/stanleygomes/moses-cli/commit/e0175cb771b0b741572a7f0602c909cac6835711))


### Documentation

* ajuste screenshot readme ([dafa1ca](https://github.com/stanleygomes/moses-cli/commit/dafa1cac068eb1d425e21cb9e9aa4f22fc25d6bb))
* atualizando readme ([faa04f1](https://github.com/stanleygomes/moses-cli/commit/faa04f1ba1f1090a60724c6363d5584acc1eebd4))
* project name to moses-cli ([5f4bed1](https://github.com/stanleygomes/moses-cli/commit/5f4bed10df93e1f72c0550104eada9442df427dd))
* remove  unuseful Links section from README ([d3ba794](https://github.com/stanleygomes/moses-cli/commit/d3ba79436bdb032a2bb2e5258d67005b488c38f0))
* screenshot no readme ([dda82e5](https://github.com/stanleygomes/moses-cli/commit/dda82e579951af19e1eb8caf93679773d04e884f))
