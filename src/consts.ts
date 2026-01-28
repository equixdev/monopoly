export const getDice = () =>
  Math.floor(Math.random() * 6) + 1

export interface ICard {
  color?: string;
  description?: string;
  price?: number;
  rent?: number[];
}

export interface Property {
  isMortgaged?: boolean
  houses?: number
}

export interface Player {
  position: number
  color: string
  money: number
  cards: {
    [key: number]: Property;
  };
}

