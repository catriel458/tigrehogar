import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import AboutSection from "@/components/about-section";
import { ProductFilters } from "@/components/product-filters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Product } from "@shared/schema";

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    category: string | null;
    priceRange: [number, number];
  }>({
    category: null,
    priceRange: [0, 1000000],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesPrice = 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1];

    return matchesCategory && matchesPrice;
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif text-center mb-8">
            Bienvenidos a Casa Comfort
          </h1>
          <p className="text-center text-lg mb-12 text-muted-foreground">
            Tu tienda de confianza en Zona Norte para artículos del hogar, vestimenta y mucho más
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
            <div className="lg:col-span-1">
              {products && (
                <ProductFilters
                  products={products}
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>

            <div className="lg:col-span-3">
              <h2 className="text-3xl font-serif mb-8">
                Nuestros Productos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {isLoading ? (
                  Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                    <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
                  ))
                ) : (
                  paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </section>

        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}