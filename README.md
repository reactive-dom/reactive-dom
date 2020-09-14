# Reactive DOM

***Use relative imports only***
Absolute imports don't resolve when building (tsc) the entire monorepo from root folder.
Building the entire monorepo is required to generate TypeDoc documentation.
When possible, use "lerna run build" to build every package individually.