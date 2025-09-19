export interface ProviderModelFetcher {
  fetchModels(): Promise<string[]>;
}
