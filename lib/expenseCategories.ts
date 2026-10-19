export const EXPENSE_CATEGORIES = [
  'Supermercado',
  'Restauración',
  'Caprichos',
  'Transporte',
  'Hogar',
  'Compras',
  'Ocio',
  'Suscripciones',
  'Salud',
  'Otros',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Supermercado: '#6ea6ff',
  Restauración: '#ff9a9a',
  Caprichos: '#f28ac2',
  Transporte: '#f5b95f',
  Hogar: '#9b8afb',
  Compras: '#48b8c7',
  Ocio: '#d47be8',
  Suscripciones: '#ec786f',
  Salud: '#65c99a',
  Otros: '#8f98a6',
};

const CATEGORY_KEYWORDS: Array<[ExpenseCategory, string[]]> = [
  ['Supermercado', ['mercadona', 'lidl', 'carrefour', 'aldi', 'dia', 'supercor', 'supermercado', 'eroski', 'alcampo', 'consum', 'hipercor', 'leclerc', 'e leclerc', 'eleclerc', 'elecler', 'coviran', 'masymas', 'spar', 'ahorramas', 'bonarea', 'froiz', 'cash fresh', 'alimentacion']],
  ['Restauración', ['restaurante', 'bar', 'cafe', 'cafeteria', 'pizza', 'pizzeria', 'burger', 'mcdonalds', 'mcdonald', 'kfc', 'tapas', 'desayuno', 'glovo', 'just eat', 'ubereats', 'uber eats', 'telepizza', 'dominos', 'comida fuera', 'cena fuera', 'churreria', 'panaderia', 'pasteleria', 'asador', 'meson', 'taberna']],
  ['Caprichos', ['gominolas', 'gominola', 'chuches', 'chuche', 'caramelos', 'caramelo', 'helado', 'helados', 'snack', 'snacks', 'dulces', 'dulce', 'chocolate', 'refresco', 'refrescos', 'bolleria']],
  ['Transporte', ['gasolina', 'gasolinera', 'repsol', 'cepsa', 'petronor', 'galp', 'shell', 'diesel', 'parking', 'aparcamiento', 'taxi', 'uber', 'cabify', 'metro', 'autobus', 'bus', 'tren', 'renfe', 'peaje', 'combustible', 'billete']],
  ['Hogar', ['alquiler', 'hipoteca', 'luz', 'agua', 'gas', 'electricidad', 'endesa', 'iberdrola', 'naturgy', 'internet', 'fibra', 'telefono', 'ikea', 'leroy merlin', 'bricomart', 'mueble', 'hogar', 'electrodomestico', 'ferreteria', 'limpieza']],
  ['Compras', ['action', 'primark', 'zara', 'pull and bear', 'bershka', 'stradivarius', 'decathlon', 'amazon', 'aliexpress', 'temu', 'shein', 'ropa', 'zapatos', 'calzado', 'regalo', 'regalos', 'bazaar', 'bazar', 'tienda', 'perfumeria', 'media markt', 'mediamarkt', 'fnac', 'electronica']],
  ['Suscripciones', ['netflix', 'spotify', 'hbo', 'disney plus', 'amazon prime', 'prime video', 'youtube premium', 'apple music', 'icloud', 'google one', 'suscripcion', 'gimnasio', 'gym', 'movistar plus', 'dazn']],
  ['Ocio', ['cine', 'juego', 'steam', 'playstation', 'xbox', 'nintendo', 'concierto', 'entrada', 'viaje', 'hotel', 'copas', 'discoteca', 'ocio', 'museo', 'parque', 'escapada', 'vacaciones', 'bolera', 'loteria']],
  ['Salud', ['farmacia', 'medico', 'dentista', 'hospital', 'salud', 'medicina', 'optica', 'fisioterapia', 'fisioterapeuta', 'psicologo', 'seguro medico', 'parafarmacia', 'veterinario', 'veterinaria']],
];

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const containsTerm = (description: string, term: string) =>
  ` ${description} `.includes(` ${normalize(term)} `);

export function inferExpenseCategory(description: string): ExpenseCategory {
  const normalized = normalize(description);
  return CATEGORY_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => containsTerm(normalized, keyword)))?.[0] || 'Otros';
}
