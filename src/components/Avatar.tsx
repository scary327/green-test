import styles from './Avatar.module.css';

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#e879f9'];

function hash(str: string) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, id, size = 44 }: { name: string; id: string; size?: number }) {
  const initials = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: COLORS[hash(id) % COLORS.length],
        fontSize: size * 0.4,
      }}
    >
      {initials || '?'}
    </div>
  );
}
