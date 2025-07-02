import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Save,
  Edit,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkOperatorViewProps {
  operatorName?: string;
  operatorLogo?: string;
  products?: Product[];
  providers?: Provider[];
  networkFee?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  provider: Provider;
}

interface Provider {
  id: string;
  name: string;
  logo: string;
}

const NetworkOperatorView: React.FC<NetworkOperatorViewProps> = ({
  operatorName = "Valhalla Fiber",
  operatorLogo = "https://api.dicebear.com/7.x/avataaars/svg?seed=network",
  products = [
    {
      id: "1",
      name: "High-Speed Internet",
      description: "Fiber optic internet with speeds up to 1Gbps",
      price: 89.99,
      type: "Internet",
      provider: {
        id: "1",
        name: "Noodle Fiber",
        logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=noodle",
      },
    },
    {
      id: "2",
      name: "Business VoIP",
      description: "Enterprise-grade voice over IP solution",
      price: 49.99,
      type: "VoIP",
      provider: {
        id: "2",
        name: "Podunk Fiber",
        logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=podunk",
      },
    },
    {
      id: "3",
      name: "Cloud Storage",
      description: "Secure cloud storage for businesses",
      price: 29.99,
      type: "Storage",
      provider: {
        id: "3",
        name: "Fiddle Faddle Fiber",
        logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiddle",
      },
    },
  ],
  providers = [
    {
      id: "1",
      name: "Noodle Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=noodle",
    },
    {
      id: "2",
      name: "Podunk Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=podunk",
    },
    {
      id: "3",
      name: "Fiddle Faddle Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiddle",
    },
  ],
  networkFee = 5.99,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [currentFee, setCurrentFee] = useState(networkFee);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || product.type === selectedType;
    const matchesProvider =
      selectedProvider === "all" || product.provider.id === selectedProvider;

    return matchesSearch && matchesType && matchesProvider;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "type":
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "provider":
        aValue = a.provider.name.toLowerCase();
        bValue = b.provider.name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get unique product types for filter dropdown
  const productTypes = [
    "all",
    ...new Set(products.map((product) => product.type)),
  ];

  const handleSaveFee = () => {
    // In a real app, this would save the fee to the backend
    setIsEditingFee(false);
    // Show success message or notification
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </div>
    </TableHead>
  );

  return (
    <div className="bg-background p-6 w-full">
      {/* Operator Profile Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div
            className={`h-16 w-16 rounded-full p-1 ${
              operatorName === "Valhalla Fiber"
                ? "bg-teal-500"
                : operatorName === "Lochness Fiber"
                  ? "bg-orange-500"
                  : operatorName === "Shangri La Fiber"
                    ? "bg-purple-500"
                    : "bg-teal-500"
            }`}
          >
            <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
              <img
                src="/meernatlogo.png"
                alt={operatorName || "Logo"}
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{operatorName}</h1>
          <p className="text-muted-foreground">Network Operator Dashboard</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="fees">Network Fees</TabsTrigger>
          <TabsTrigger value="providers">Service Providers</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Types" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="name">Product Name</SortableHeader>
                    <SortableHeader field="type">Type</SortableHeader>
                    <TableHead>Billing Frequency</TableHead>
                    <SortableHeader field="price">Price</SortableHeader>
                    <SortableHeader field="provider">
                      Service Provider
                    </SortableHeader>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Monthly</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {product.provider.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No products found matching your filters.
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedProducts.length,
                    )}{" "}
                    of {sortedProducts.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Fees Tab */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Fee Management</CardTitle>
              <CardDescription>
                Set and manage the network fee applied to all service provider
                products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Network Fee</h3>
                    <p className="text-sm text-muted-foreground">
                      Applied to all service provider products
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingFee ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-2.5">$</span>
                          <Input
                            type="number"
                            value={currentFee}
                            onChange={(e) =>
                              setCurrentFee(parseFloat(e.target.value))
                            }
                            className="pl-6 w-24"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <Button onClick={handleSaveFee} size="sm">
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg py-1 px-3">
                          ${currentFee.toFixed(2)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingFee(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Fee Revenue Projection</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on current service provider products and subscription
                    estimates.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Monthly Revenue
                          </p>
                          <p className="text-2xl font-bold">
                            ${(currentFee * 150).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Quarterly Revenue
                          </p>
                          <p className="text-2xl font-bold">
                            ${(currentFee * 150 * 3).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Annual Revenue
                          </p>
                          <p className="text-2xl font-bold">
                            ${(currentFee * 150 * 12).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Service Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search providers..." className="pl-8" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Provider Directory</CardTitle>
              <CardDescription>
                All service providers in your network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => {
                    const providerProducts = products.filter(
                      (p) => p.provider.id === provider.id,
                    );
                    const totalRevenue = providerProducts.reduce(
                      (sum, product) => sum + product.price,
                      0,
                    );

                    return (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {provider.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{providerProducts.length}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>${totalRevenue.toFixed(2)}/mo</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkOperatorView;
