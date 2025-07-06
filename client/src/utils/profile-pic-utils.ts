export const getInitials = (name: string | undefined): string => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  let initials = '';

  if (parts.length > 0) {
    initials += parts[0].charAt(0).toUpperCase();
  }

  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }

  return initials || '?';
};

const getColorFromName = (name: string | undefined, colors: string[]): string => {
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const createAvatarFromName = (name: string | undefined, size = 40): string => {
  const initials = getInitials(name);
  const colors = [
    '#FFB900', '#FF8C00', '#F7630C', '#CA5010', '#DA3B01', 
    '#EF6950', '#D13438', '#FF4343', '#E74856', '#E81123',
    '#EA005E', '#C30052', '#E3008C', '#BF0077', '#C239B3',
    '#9A0089', '#0078D7', '#0063B1', '#8E8CD8', '#6B69D6',
    '#8764B8', '#744DA9', '#B146C2', '#881798', '#0099BC',
    '#2D7D9A', '#00B7C3', '#038387', '#00B294', '#018574',
    '#00CC6A', '#10893E', '#7A7574', '#5D5A58', '#68768A',
    '#515C6B', '#567C73', '#486860', '#498205', '#107C10'
  ];

  const color = getColorFromName(name, colors);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color}" rx="${size / 2}" />
      <text x="50%" y="50%" fill="#FFFFFF" font-family="Arial" font-size="${size / 2}" text-anchor="middle" dy=".35em">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
