export const fixtures = [
  {
    hex: '70736274fe',
    exception: 'Format Error: Magic Number must be followed by 0xff separator',
  },
  {
    hex: '70736274ff010801ff010801ff00',
    exception: 'Format Error: Keys must be unique for global keymap: key 08',
  },
  {
    hex: '70736274ff010002000100010801ff010801fe00',
    exception:
      'Format Error: Keys must be unique for each output: output index 0 key 08',
  },
  // Non-canonical key length (fd 01 00 = 1)
  {
    hex: '70736274fffd01000801ff00',
    exception: 'Format Error: non-canonical varint encoding',
  },
  // Non-canonical value length (fd 01 00 = 1)
  {
    hex: '70736274ff0108fd0100ff00',
    exception: 'Format Error: non-canonical varint encoding',
  },
  // Non-canonical key length (fe / ff prefixes)
  {
    hex: '70736274fffe010000000801ff00',
    exception: 'Format Error: non-canonical varint encoding',
  },
  {
    hex: '70736274ffff01000000000000000801ff00',
    exception: 'Format Error: non-canonical varint encoding',
  },
  // Zero-length key via fd 00 00 (canonical 0x00 is the map terminator)
  {
    hex: '70736274fffd0000000100',
    exception: 'Format Error: non-canonical varint encoding',
  },
];
