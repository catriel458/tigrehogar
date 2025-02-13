import { products, type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private currentId: number;

  constructor() {
    this.products = new Map();
    this.currentId = 1;
    
    // Add some initial products
    const initialProducts: InsertProduct[] = [
      {
        name: "Cozy Knit Blanket",
        description: "Super soft knitted blanket perfect for chilly evenings",
        price: 4999,
        image: "https://images.unsplash.com/photo-1524634126442-357e0eac3c14",
        category: "Bedding"
      },
      {
        name: "Ceramic Vase Set",
        description: "Modern ceramic vases in pastel colors",
        price: 3499,
        image: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d",
        category: "Decor"
      },
      {
        name: "Kitchen Utensil Set",
        description: "Complete set of essential kitchen tools",
        price: 2999,
        image: "https://images.unsplash.com/photo-1597817109745-c418f4875230",
        category: "Kitchen"
      }
    ];

    initialProducts.forEach(product => this.createProduct(product));
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
}

export const storage = new MemStorage();
