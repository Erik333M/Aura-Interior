import type { Configuration } from '@/components/Configurator';

/** Human-readable spec line for the enquiry — what the workshop actually reads. */
export function describeConfiguration(
  config: Configuration,
  fabricName: string | undefined,
  labels: { size: string; fabric: string; cm: string; price?: string },
  formattedPrice?: string,
): string {
  const lines = [
    `${labels.size}: ${config.widthCm} × ${config.depthCm} × ${config.heightCm} ${labels.cm}`,
  ];
  if (fabricName) lines.push(`${labels.fabric}: ${fabricName}`);
  // Include the price the customer was actually looking at, so a quote can be
  // checked against what the site showed rather than reconstructed.
  if (formattedPrice && labels.price) lines.push(`${labels.price}: ${formattedPrice}`);
  return lines.join('\n');
}
