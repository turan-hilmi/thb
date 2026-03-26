import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function calculateArsaPayi(
  sections: { brutM2: number }[],
  totalYuzolcum: number
): { pay: number; payda: number }[] {
  const totalBrut = sections.reduce((sum, s) => sum + s.brutM2, 0);
  if (totalBrut === 0) return sections.map(() => ({ pay: 0, payda: 1 }));

  const rawShares = sections.map((s) => s.brutM2 / totalBrut);
  const payda = 1000;
  const pays = rawShares.map((r) => Math.round(r * payda));

  return pays.map((pay) => {
    const g = gcd(pay, payda);
    return { pay: pay / g, payda: payda / g };
  });
}
