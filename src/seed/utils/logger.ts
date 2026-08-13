export function seedLogger(moduleName: string) {
  return {
    info: (message: string) => console.log(`[SEED] ${moduleName} - ${message}`),
    error: (message: string, error?: any) => console.error(`[SEED ERROR] ${moduleName} - ${message}`, error || ''),
    warn: (message: string) => console.warn(`[SEED WARN] ${moduleName} - ${message}`),
    success: (message: string) => console.log(`[SEED SUCCESS] ${moduleName} - ${message}`),
  }
}
