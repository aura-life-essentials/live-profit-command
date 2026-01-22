import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vendors: string[];
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  productTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
  totalResults: number;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  vendors,
  selectedVendor,
  onVendorChange,
  productTypes,
  selectedType,
  onTypeChange,
  stockFilter,
  onStockFilterChange,
  totalResults,
}: ProductFiltersProps) {
  const hasActiveFilters = searchQuery || selectedVendor !== 'all' || selectedType !== 'all' || stockFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onVendorChange('all');
    onTypeChange('all');
    onStockFilterChange('all');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border focus:border-primary focus:ring-primary"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Vendor Filter */}
        <Select value={selectedVendor} onValueChange={onVendorChange}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor} value={vendor}>
                {vendor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Product Type Filter */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {productTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stock Filter */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['all', 'in-stock', 'out-of-stock'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onStockFilterChange(filter)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                stockFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {filter === 'all' ? 'All' : filter === 'in-stock' ? 'In Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Results Count */}
        <span className="ml-auto text-sm text-muted-foreground font-mono">
          {totalResults} product{totalResults !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
