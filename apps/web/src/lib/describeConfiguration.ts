import type { Configuration } from '@/components/Configurator';

/** Human-readable spec line for the enquiry — what the workshop actually reads. */
export function describeConfiguration(
  config: Configuration,
  fabricName: string | undefined,
  labels: { size: string; fabric: string; cm: string },
): string {
  const size = `${labels.size}: ${config.widthCm} × ${config.depthCm} × ${config.heightCm} ${labels.cm}`;
  return fabricName ? `${size}\n${labels.fabric}: ${fabricName}` : size;
}
