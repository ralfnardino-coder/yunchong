export interface Student {
  id: string;
  name: string;
  studentNo?: string;
  points: number;
  petId: string;
  level: number;
  classId: string;
  medals: number;
}

export interface Pet {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  color?: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface ScoringRule {
  id: string;
  category: 'study' | 'behavior' | 'health' | 'kindergarten' | 'other';
  label: string;
  points: number;
  type: 'plus' | 'minus';
  icon: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  icon: string;
  description: string;
}

export interface Log {
  id: string;
  studentId: string;
  studentName: string;
  ruleLabel: string;
  points: number;
  timestamp: string;
}

export interface GrowthConfig {
  level: number;
  pointsRequired: number;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BlindBoxItem {
  id: string;
  name: string;
  type: 'pet' | 'skin' | 'item';
  rarity: Rarity;
  imageUrl: string;
  description: string;
}

export interface InventoryItem extends BlindBoxItem {
  obtainedAt: string;
}
