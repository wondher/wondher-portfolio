// Mutado pelo orquestrador (fora do render do React); lido por referência em useFrame.
// Contrato: nenhum consumidor faz setState a partir destes valores por frame.
export const scrollState = {
  progress: 0, // 0..1 progresso bruto da página
  lerped: 0,   // suavizado no ticker (uProgress dos shaders)
  velocity: 0,
  cluster: 0,  // 0..3 progresso da seção Capabilities (pin)
  pointer: { x: 0, y: 0 }, // NDC -1..1
};

export function resetScrollState(): void {
  scrollState.progress = 0;
  scrollState.lerped = 0;
  scrollState.velocity = 0;
  scrollState.cluster = 0;
  scrollState.pointer.x = 0;
  scrollState.pointer.y = 0;
}
