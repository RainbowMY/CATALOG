import type { CategoryNode } from '../types'

export const categories: CategoryNode[] = [
  {
    id: 'apparel',
    name: 'Apparel & Accessories',
    children: [
      {
        id: 'women',
        name: "Women's Clothing",
        children: [
          { id: 'dresses', name: 'Dresses' },
          { id: 'blouses', name: 'Blouses & Tops' },
          { id: 'tees', name: 'T-Shirts' },
          { id: 'outerwear', name: 'Outerwear' },
          { id: 'activewear', name: 'Activewear' },
        ],
      },
      {
        id: 'men',
        name: "Men's Clothing",
        children: [
          { id: 'shirts', name: 'Shirts' },
          { id: 'polos', name: 'Polo Shirts' },
          { id: 'jeans', name: 'Jeans' },
          { id: 'jackets', name: 'Jackets' },
        ],
      },
      {
        id: 'shoes',
        name: 'Footwear',
        children: [
          { id: 'sneakers', name: 'Sneakers' },
          { id: 'boots', name: 'Boots' },
          { id: 'sandals', name: 'Sandals' },
        ],
      },
    ],
  },
  {
    id: 'electronics',
    name: 'Consumer Electronics',
    children: [
      {
        id: 'phones',
        name: 'Phones & Accessories',
        children: [
          { id: 'cases', name: 'Phone Cases' },
          { id: 'chargers', name: 'Chargers' },
          { id: 'earbuds', name: 'Earbuds' },
        ],
      },
      {
        id: 'audio',
        name: 'Audio Devices',
        children: [
          { id: 'headphones', name: 'Headphones' },
          { id: 'speakers', name: 'Speakers' },
        ],
      },
      {
        id: 'wearables',
        name: 'Smart Wearables',
        children: [
          { id: 'watches', name: 'Smart Watches' },
          { id: 'bands', name: 'Fitness Bands' },
        ],
      },
    ],
  },
  {
    id: 'home',
    name: 'Home & Garden',
    children: [
      {
        id: 'kitchen',
        name: 'Kitchen & Dining',
        children: [
          { id: 'cookware', name: 'Cookware' },
          { id: 'mugs', name: 'Mugs & Cups' },
          { id: 'storage', name: 'Food Storage' },
        ],
      },
      {
        id: 'decor',
        name: 'Home Decor',
        children: [
          { id: 'lighting', name: 'Lighting' },
          { id: 'rugs', name: 'Rugs' },
          { id: 'wallart', name: 'Wall Art' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    children: [
      {
        id: 'skincare',
        name: 'Skincare',
        children: [
          { id: 'serum', name: 'Serums' },
          { id: 'masks', name: 'Face Masks' },
          { id: 'spf', name: 'Sunscreen' },
        ],
      },
      {
        id: 'hair',
        name: 'Hair Care',
        children: [
          { id: 'shampoo', name: 'Shampoo' },
          { id: 'tools', name: 'Styling Tools' },
        ],
      },
    ],
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    children: [
      {
        id: 'fitness',
        name: 'Fitness Gear',
        children: [
          { id: 'yoga', name: 'Yoga Mats' },
          { id: 'bands', name: 'Resistance Bands' },
          { id: 'bottles', name: 'Sports Bottles' },
        ],
      },
      {
        id: 'outdoor',
        name: 'Outdoor Gear',
        children: [
          { id: 'camping', name: 'Camping Lights' },
          { id: 'bags', name: 'Hiking Bags' },
        ],
      },
    ],
  },
  {
    id: 'pets',
    name: 'Pet Supplies',
    children: [
      {
        id: 'dog',
        name: 'Dog Supplies',
        children: [
          { id: 'toys', name: 'Dog Toys' },
          { id: 'grooming', name: 'Grooming' },
        ],
      },
      {
        id: 'cat',
        name: 'Cat Supplies',
        children: [
          { id: 'trees', name: 'Cat Trees' },
          { id: 'litter', name: 'Litter Tools' },
        ],
      },
    ],
  },
]

export function flattenCategories() {
  const rows: { l1: string; l2: string; l3: string; path: [string, string, string] }[] = []
  for (const l1 of categories) {
    for (const l2 of l1.children ?? []) {
      for (const l3 of l2.children ?? []) {
        rows.push({
          l1: l1.name,
          l2: l2.name,
          l3: l3.name,
          path: [l1.name, l2.name, l3.name],
        })
      }
    }
  }
  return rows
}
