import React, { useState } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useServiceProviderSettings } from "@/hooks/useServiceProviderSettings";
import { useToast } from "@/components/ui/use-toast";

interface NetworkOperator {
  id: string;
  name: string;
  logo: string;
  fee: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pendingPrice?: number;
  type: string;
  isMonthly: boolean;
  maxQuantity?: number;
  networkOperators: NetworkOperator[];
}

interface ServiceProviderViewProps {
  providerName?: string;
  providerLogo?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ServiceProviderView: React.FC<ServiceProviderViewProps> = ({
  providerName = "Noodle Fiber",
  providerLogo = "https://api.dicebear.com/7.x/avataaars/svg?seed=noodle",
  activeTab = "products",
  onTabChange,
}) => {
  // Mock data for products
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Business Internet",
      description: "High-speed fiber internet for businesses",
      price: 99.99,
      pendingPrice: 109.99,
      type: "Internet",
      isMonthly: true,
      maxQuantity: 1,
      networkOperators: [
        {
          id: "1",
          name: "Valhalla Fiber",
          logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=valhalla",
          fee: 10,
        },
      ],
    },
    {
      id: "2",
      name: "VoIP Phone System",
      description: "Enterprise VoIP solution with unlimited calling",
      price: 49.99,
      type: "VoIP",
      isMonthly: true,
      networkOperators: [
        {
          id: "1",
          name: "Valhalla Fiber",
          logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=valhalla",
          fee: 10,
        },
        {
          id: "2",
          name: "Lochness Fiber",
          logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=lochness",
          fee: 8,
        },
      ],
    },
    {
      id: "3",
      name: "Security Suite",
      description: "Complete security package for business protection",
      price: 299.99,
      type: "Security",
      isMonthly: false,
      networkOperators: [
        {
          id: "3",
          name: "Shangri La Fiber",
          logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=shangri",
          fee: 15,
        },
      ],
    },
  ]);

  // Mock data for network operators
  const networkOperators: NetworkOperator[] = [
    {
      id: "1",
      name: "Valhalla Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=valhalla",
      fee: 10,
    },
    {
      id: "2",
      name: "Lochness Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=lochness",
      fee: 8,
    },
    {
      id: "3",
      name: "Shangri La Fiber",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=shangri",
      fee: 12,
    },
  ];

  // Product types
  const productTypes = [
    "Internet",
    "VoIP",
    "Security",
    "Learning Services",
    "Cloud Storage",
    "Consulting",
  ];

  // State for product form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedNetworkOperators, setSelectedNetworkOperators] = useState<
    string[]
  >([]);
  const [previewNetworkOperator, setPreviewNetworkOperator] =
    useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "",
    isMonthly: true,
    maxQuantity: "",
  });
  const [fccData, setFccData] = useState({
    // Speeds Provided with Plan
    typicalDownloadSpeed: "",
    typicalUploadSpeed: "",
    dataUsageDetailsLink: "",
    // Price Details
    monthlyPrice: "",
    isIntroductoryRate: false,
    introductoryDuration: "",
    priceAfterIntroductory: "",
    contractLength: "",
    contractTermsLink: "",
    // Additional Charges & Terms
    providerMonthlyFeesDescription: "",
    providerMonthlyFeesPrice: "",
    oneTimePurchaseFeesDescription: "",
    oneTimePurchaseFeesPrice: "",
    earlyTerminationFee: "",
    governmentTaxes: "",
    // Data Included with Monthly Price
    gbIncluded: "",
    additionalUsageCharges: "",
    dataUsageLink: "",
    // Privacy Policy & Customer Support
    privacyPolicyLink: "",
    websiteLink: "",
    customerSupportPhone: "",
  });
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBilling, setSelectedBilling] = useState("all");
  const [selectedOperator, setSelectedOperator] = useState("all");
  const itemsPerPage = 10;

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const {
    settings,
    isLoading: settingsLoading,
    isSaving: settingsSaving,
    error: settingsError,
    saveSettings,
    updateSetting,
  } = useServiceProviderSettings();

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || product.type === selectedType;
    const matchesBilling =
      selectedBilling === "all" ||
      (selectedBilling === "monthly" && product.isMonthly) ||
      (selectedBilling === "one-time" && !product.isMonthly);
    const matchesOperator =
      selectedOperator === "all" ||
      product.networkOperators.some((op) => op.id === selectedOperator);

    return matchesSearch && matchesType && matchesBilling && matchesOperator;
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
      case "billing":
        aValue = a.isMonthly ? "monthly" : "one-time";
        bValue = b.isMonthly ? "monthly" : "one-time";
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle FCC form input changes
  const handleFccInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFccData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle FCC checkbox changes
  const handleFccCheckboxChange = (name: string, checked: boolean) => {
    setFccData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle switch toggle
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isMonthly: checked }));
  };

  // Handle network operator selection
  const handleNetworkOperatorToggle = (operatorId: string) => {
    setSelectedNetworkOperators((prev) =>
      prev.includes(operatorId)
        ? prev.filter((id) => id !== operatorId)
        : [...prev, operatorId],
    );
  };

  // Open dialog for creating a new product
  const openNewProductDialog = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      type: "",
      isMonthly: true,
      maxQuantity: "",
    });
    setFccData({
      // Speeds Provided with Plan
      typicalDownloadSpeed: "",
      typicalUploadSpeed: "",
      dataUsageDetailsLink: "",
      // Price Details
      monthlyPrice: "",
      isIntroductoryRate: false,
      introductoryDuration: "",
      priceAfterIntroductory: "",
      contractLength: "",
      contractTermsLink: "",
      // Additional Charges & Terms
      providerMonthlyFeesDescription: "",
      providerMonthlyFeesPrice: "",
      oneTimePurchaseFeesDescription: "",
      oneTimePurchaseFeesPrice: "",
      earlyTerminationFee: "",
      governmentTaxes: "",
      // Data Included with Monthly Price
      gbIncluded: "",
      additionalUsageCharges: "",
      dataUsageLink: "",
      // Privacy Policy & Customer Support
      privacyPolicyLink: "",
      websiteLink: "",
      customerSupportPhone: "",
    });
    setSelectedNetworkOperators([]);
    setIsDialogOpen(true);
  };

  // Open dialog for editing an existing product
  const openEditProductDialog = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: (product.pendingPrice || product.price).toString(), // Show pending price if exists, otherwise current price
      type: product.type,
      isMonthly: product.isMonthly,
      maxQuantity: product.maxQuantity?.toString() || "",
    });
    // Load existing FCC data or set defaults
    setFccData({
      // Speeds Provided with Plan
      typicalDownloadSpeed: "100",
      typicalUploadSpeed: "20",
      dataUsageDetailsLink: "https://example.com/data-usage",
      // Price Details
      monthlyPrice: product.price.toString(),
      isIntroductoryRate: false,
      introductoryDuration: "",
      priceAfterIntroductory: "",
      contractLength: "12",
      contractTermsLink: "https://example.com/terms",
      // Additional Charges & Terms
      providerMonthlyFeesDescription: "Equipment rental",
      providerMonthlyFeesPrice: "10.00",
      oneTimePurchaseFeesDescription: "Installation fee",
      oneTimePurchaseFeesPrice: "99.00",
      earlyTerminationFee: "200.00",
      governmentTaxes: "Applicable taxes and fees may apply",
      // Data Included with Monthly Price
      gbIncluded: "Unlimited",
      additionalUsageCharges: "N/A",
      dataUsageLink: "https://example.com/data-policy",
      // Privacy Policy & Customer Support
      privacyPolicyLink: "https://example.com/privacy",
      websiteLink: "https://example.com",
      customerSupportPhone: "+1 (555) 123-4567",
    });
    setSelectedNetworkOperators(product.networkOperators.map((op) => op.id));
    setIsDialogOpen(true);
  };

  // Open preview dialog for a product
  const openPreviewDialog = (product: Product) => {
    setCurrentProduct(product);
    // Set the first available network operator as default for preview
    setPreviewNetworkOperator(
      product.networkOperators && product.networkOperators.length > 0
        ? product.networkOperators[0].id
        : "",
    );
    setIsPreviewOpen(true);
  };

  // Handle product save
  const handleSaveProduct = () => {
    // Create new product object
    const productData: Product = {
      id: currentProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: currentProduct ? currentProduct.price : parseFloat(formData.price), // Keep current price for existing products
      type: formData.type,
      isMonthly: formData.isMonthly,
      networkOperators: networkOperators.filter((op) =>
        selectedNetworkOperators.includes(op.id),
      ),
    };

    // For existing products, set pending price if different from current price
    if (currentProduct && parseFloat(formData.price) !== currentProduct.price) {
      productData.pendingPrice = parseFloat(formData.price);
    } else if (!currentProduct) {
      // For new products, use the entered price as the current price
      productData.price = parseFloat(formData.price);
    }

    if (formData.maxQuantity) {
      productData.maxQuantity = parseInt(formData.maxQuantity);
    }

    // Update products state
    if (currentProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === currentProduct.id ? productData : p)),
      );
    } else {
      setProducts((prev) => [...prev, productData]);
    }

    // Close dialog
    setIsDialogOpen(false);
  };

  // Handle product delete
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Calculate total fees for a product
  const calculateTotalFees = (product: Product) => {
    return product.networkOperators.reduce((total, op) => total + op.fee, 0);
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
    <div className="bg-background p-6 min-h-screen">
      {/* Provider Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`h-16 w-16 rounded-full p-1 ${providerName === "Noodle Fiber"
                ? "bg-purple-500"
                : providerName === "Podunk Fiber"
                  ? "bg-yellow-500"
                  : providerName === "Fiddle Faddle Fiber"
                    ? "bg-lime-500"
                    : "bg-purple-500"
                }`}
            >
              <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                <img
                  src="/meernatlogo.png"
                  alt={providerName || "Logo"}
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{providerName}</h1>
            <p className="text-muted-foreground">Service Provider Dashboard</p>
          </div>
        </div>
        <Button onClick={openNewProductDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedOperator}
                onValueChange={setSelectedOperator}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Network Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  {networkOperators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
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
              <Select
                value={selectedBilling}
                onValueChange={setSelectedBilling}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by billing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="name">Product Name</SortableHeader>
                    <SortableHeader field="type">Type</SortableHeader>
                    <SortableHeader field="billing">
                      Billing Frequency
                    </SortableHeader>
                    <SortableHeader field="price">Price</SortableHeader>
                    <TableHead>Network Operators</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <Badge variant="secondary">
                          {product.isMonthly ? "Monthly" : "One-time"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>${product.price.toFixed(2)}</span>
                          {product.pendingPrice && (
                            <span className="text-xs text-muted-foreground">
                              (pending: ${product.pendingPrice.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {selectedOperator === "all" ? (
                            // Show all operators when "All Operators" is selected
                            <>
                              {product.networkOperators
                                .slice(0, 2)
                                .map((op) => (
                                  <div
                                    key={op.id}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-xs">{op.name}</span>
                                  </div>
                                ))}
                              {product.networkOperators.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{product.networkOperators.length - 2} more
                                </span>
                              )}
                            </>
                          ) : (
                            // Show only the selected operator
                            product.networkOperators
                              .filter((op) => op.id === selectedOperator)
                              .map((op) => (
                                <div
                                  key={op.id}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-xs">{op.name}</span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (${op.fee.toFixed(2)} fee)
                                  </span>
                                </div>
                              ))
                          )}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditProductDialog(product)}
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the product "{product.name}
                                  " and remove it from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-[#FF4C4C] text-white hover:bg-[#FF4C4C]/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreviewDialog(product)}
                            className="h-8 px-2 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No products found
                  </p>
                  <Button onClick={openNewProductDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First
                    Product
                  </Button>
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
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
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
                          );
                        },
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

        <TabsContent value="settings" className="space-y-6">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading settings...</span>
            </div>
          ) : (
            <div className="grid gap-6">
              {settingsError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{settingsError}</p>
                </div>
              )}
              {/* Branding Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Branding Information</CardTitle>
                  <CardDescription>
                    Manage your company branding and visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="provider-name">
                          Service Provider Name
                        </Label>
                        <Input
                          id="provider-name"
                          value={settings.name}
                          onChange={(e) =>
                            updateSetting('name', e.target.value)
                          }
                          placeholder="Enter your company name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="logo-upload">Company Logo</Label>
                        <div className="mt-2 space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded-full">
                              <img
                                src="/meernatlogo.png"
                                alt="Logo"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload a square image (recommended: 200x200px)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Preview</h4>
                      <div className="space-y-3">
                        <div className="bg-background p-3 rounded border">
                          <p className="text-xs text-muted-foreground mb-2">
                            Dashboard Header
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full p-0.5 bg-purple-500">
                                <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                                  <img
                                    src={settings.logo_url || "/meernatlogo.png"}
                                    alt={settings.name || "Logo"}
                                    className="h-5 w-5 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">
                              {settings.name || "Your Company Name"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-background p-3 rounded border">
                          <p className="text-xs text-muted-foreground mb-2">
                            Subscriber View
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full p-0.5 bg-purple-500">
                                <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                                  <img
                                    src={settings.logo_url || "/meernatlogo.png"}
                                    alt={settings.name || "Logo"}
                                    className="h-5 w-5 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {settings.name || "Your Company Name"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Service Provider
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Manage your company contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={settings.location || ''}
                          onChange={(e) =>
                            updateSetting('location', e.target.value)
                          }
                          placeholder="City, State/Country"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={settings.phone_number || ''}
                          onChange={(e) =>
                            updateSetting('phone_number', e.target.value)
                          }
                          placeholder="+1 (555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email || ''}
                          onChange={(e) =>
                            updateSetting('email', e.target.value)
                          }
                          placeholder="contact@company.com"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                          id="website"
                          type="url"
                          value={settings.website_url || ''}
                          onChange={(e) =>
                            updateSetting('website_url', e.target.value)
                          }
                          placeholder="https://www.company.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={async () => {
                    const result = await saveSettings(settings);
                    if (result.success) {
                      toast({
                        title: "Settings saved",
                        description: "Your service provider settings have been updated successfully.",
                      });
                    } else {
                      toast({
                        title: "Error saving settings",
                        description: "There was an error saving your settings. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={settingsSaving}
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {currentProduct
                ? "Update your product details below."
                : "Fill in the details for your new product."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="fcc">FCC Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {currentProduct && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Current Price: ${currentProduct.price.toFixed(2)}{" "}
                        (active this month)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: Price updates will apply starting next month and
                      affect all current and future subscribers.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="type">Product Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger id="type" className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="billing">Billing Frequency</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="billing"
                          checked={formData.isMonthly}
                          onCheckedChange={handleSwitchChange}
                        />
                        <span>
                          {formData.isMonthly ? "Monthly" : "One-time"}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <Label htmlFor="maxQuantity">
                        Max Quantity (Optional)
                      </Label>
                      <Input
                        id="maxQuantity"
                        name="maxQuantity"
                        type="number"
                        value={formData.maxQuantity}
                        onChange={handleInputChange}
                        placeholder="Unlimited"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Network Operators</Label>
                    <div className="mt-2 border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Select</TableHead>
                            <TableHead>Network Operator</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {networkOperators.map((operator) => (
                            <TableRow key={operator.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedNetworkOperators.includes(
                                    operator.id,
                                  )}
                                  onChange={() =>
                                    handleNetworkOperatorToggle(operator.id)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {operator.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${operator.fee.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      These fees are set by network operators and are not
                      editable. Subscribers will only be charged the fee
                      associated with their operator.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fcc" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Speeds Provided with Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Speeds Provided with Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="typicalDownloadSpeed">
                          Typical Download Speed (Mbps) *
                        </Label>
                        <Input
                          id="typicalDownloadSpeed"
                          name="typicalDownloadSpeed"
                          type="number"
                          value={fccData.typicalDownloadSpeed}
                          onChange={handleFccInputChange}
                          placeholder="100"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="typicalUploadSpeed">
                          Typical Upload Speed (Mbps) *
                        </Label>
                        <Input
                          id="typicalUploadSpeed"
                          name="typicalUploadSpeed"
                          type="number"
                          value={fccData.typicalUploadSpeed}
                          onChange={handleFccInputChange}
                          placeholder="20"
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dataUsageDetailsLink">
                        Link to Data Usage Details
                      </Label>
                      <Input
                        id="dataUsageDetailsLink"
                        name="dataUsageDetailsLink"
                        type="url"
                        value={fccData.dataUsageDetailsLink}
                        onChange={handleFccInputChange}
                        placeholder="https://example.com/data-usage"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Price Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="monthlyPrice">Monthly Price ($) *</Label>
                      <Input
                        id="monthlyPrice"
                        name="monthlyPrice"
                        type="number"
                        step="0.01"
                        value={fccData.monthlyPrice}
                        onChange={handleFccInputChange}
                        placeholder="99.99"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isIntroductoryRate"
                        checked={fccData.isIntroductoryRate}
                        onCheckedChange={(checked) =>
                          handleFccCheckboxChange("isIntroductoryRate", checked)
                        }
                      />
                      <Label htmlFor="isIntroductoryRate">
                        Is this an Introductory Rate?
                      </Label>
                    </div>
                    {fccData.isIntroductoryRate && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="introductoryDuration">
                            Introductory Duration (months)
                          </Label>
                          <Input
                            id="introductoryDuration"
                            name="introductoryDuration"
                            type="number"
                            value={fccData.introductoryDuration}
                            onChange={handleFccInputChange}
                            placeholder="12"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="priceAfterIntroductory">
                            Price After Introductory Rate ($)
                          </Label>
                          <Input
                            id="priceAfterIntroductory"
                            name="priceAfterIntroductory"
                            type="number"
                            step="0.01"
                            value={fccData.priceAfterIntroductory}
                            onChange={handleFccInputChange}
                            placeholder="129.99"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contractLength">
                          Length of Contract (months)
                        </Label>
                        <Input
                          id="contractLength"
                          name="contractLength"
                          type="number"
                          value={fccData.contractLength}
                          onChange={handleFccInputChange}
                          placeholder="12"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractTermsLink">
                          Link to Terms of Contract
                        </Label>
                        <Input
                          id="contractTermsLink"
                          name="contractTermsLink"
                          type="url"
                          value={fccData.contractTermsLink}
                          onChange={handleFccInputChange}
                          placeholder="https://example.com/terms"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Charges & Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Additional Charges & Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="providerMonthlyFeesDescription">
                          Provider Monthly Fees Description
                        </Label>
                        <Input
                          id="providerMonthlyFeesDescription"
                          name="providerMonthlyFeesDescription"
                          value={fccData.providerMonthlyFeesDescription}
                          onChange={handleFccInputChange}
                          placeholder="Equipment rental"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerMonthlyFeesPrice">
                          Provider Monthly Fees Price ($)
                        </Label>
                        <Input
                          id="providerMonthlyFeesPrice"
                          name="providerMonthlyFeesPrice"
                          type="number"
                          step="0.01"
                          value={fccData.providerMonthlyFeesPrice}
                          onChange={handleFccInputChange}
                          placeholder="10.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="oneTimePurchaseFeesDescription">
                          One-Time Purchase Fees Description
                        </Label>
                        <Input
                          id="oneTimePurchaseFeesDescription"
                          name="oneTimePurchaseFeesDescription"
                          value={fccData.oneTimePurchaseFeesDescription}
                          onChange={handleFccInputChange}
                          placeholder="Installation fee"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="oneTimePurchaseFeesPrice">
                          One-Time Purchase Fees Price ($)
                        </Label>
                        <Input
                          id="oneTimePurchaseFeesPrice"
                          name="oneTimePurchaseFeesPrice"
                          type="number"
                          step="0.01"
                          value={fccData.oneTimePurchaseFeesPrice}
                          onChange={handleFccInputChange}
                          placeholder="99.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="earlyTerminationFee">
                          Early Termination Fee ($)
                        </Label>
                        <Input
                          id="earlyTerminationFee"
                          name="earlyTerminationFee"
                          type="number"
                          step="0.01"
                          value={fccData.earlyTerminationFee}
                          onChange={handleFccInputChange}
                          placeholder="200.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="governmentTaxes">
                          Government Taxes
                        </Label>
                        <Input
                          id="governmentTaxes"
                          name="governmentTaxes"
                          value={fccData.governmentTaxes}
                          onChange={handleFccInputChange}
                          placeholder="Applicable taxes and fees may apply"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Included with Monthly Price */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Data Included with Monthly Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="gbIncluded">GB Included *</Label>
                      <Input
                        id="gbIncluded"
                        name="gbIncluded"
                        value={fccData.gbIncluded}
                        onChange={handleFccInputChange}
                        placeholder="Unlimited or specific amount"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="additionalUsageCharges">
                          Charges for Additional Usage
                        </Label>
                        <Input
                          id="additionalUsageCharges"
                          name="additionalUsageCharges"
                          value={fccData.additionalUsageCharges}
                          onChange={handleFccInputChange}
                          placeholder="$10 per GB or N/A"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataUsageLink">
                          Link to Data Usage Details
                        </Label>
                        <Input
                          id="dataUsageLink"
                          name="dataUsageLink"
                          type="url"
                          value={fccData.dataUsageLink}
                          onChange={handleFccInputChange}
                          placeholder="https://example.com/data-policy"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Policy & Customer Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Privacy Policy & Customer Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="privacyPolicyLink">
                          Link to Privacy Policy
                        </Label>
                        <Input
                          id="privacyPolicyLink"
                          name="privacyPolicyLink"
                          type="url"
                          value={fccData.privacyPolicyLink}
                          onChange={handleFccInputChange}
                          placeholder="https://example.com/privacy"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="websiteLink">Website Link</Label>
                        <Input
                          id="websiteLink"
                          name="websiteLink"
                          type="url"
                          value={fccData.websiteLink}
                          onChange={handleFccInputChange}
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerSupportPhone">
                        Customer Support Phone Number *
                      </Label>
                      <Input
                        id="customerSupportPhone"
                        name="customerSupportPhone"
                        type="tel"
                        value={fccData.customerSupportPhone}
                        onChange={handleFccInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-lg p-4 shadow-lg border-2 border-blue-700 dark:border-blue-600">
                  <div className="flex items-start gap-3">
                    <div className="text-white mt-0.5 text-lg flex-shrink-0">
                      ℹ️
                    </div>
                    <div className="text-sm">
                      <p className="font-bold mb-2 text-white">
                        FCC Compliance Requirements
                      </p>
                      <p className="text-blue-100 leading-relaxed">
                        All fields marked with * are required for FCC broadband
                        labeling compliance. This information will be displayed
                        to subscribers as part of the regulatory broadband
                        label.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={
                !formData.name ||
                !formData.price ||
                !formData.type ||
                selectedNetworkOperators.length === 0 ||
                !fccData.typicalDownloadSpeed ||
                !fccData.typicalUploadSpeed ||
                !fccData.monthlyPrice ||
                !fccData.gbIncluded ||
                !fccData.customerSupportPhone
              }
            >
              {currentProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {currentProduct && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Subscriber View Preview</DialogTitle>
              <DialogDescription>
                This simulates how your product appears to subscribers in
                different network locations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-blue-600">🌐</div>
                <div className="flex-1">
                  <Label
                    htmlFor="preview-operator"
                    className="text-sm font-medium"
                  >
                    Simulate subscriber location:
                  </Label>
                  <Select
                    value={previewNetworkOperator}
                    onValueChange={setPreviewNetworkOperator}
                  >
                    <SelectTrigger id="preview-operator" className="mt-1">
                      <SelectValue placeholder="Select network operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProduct.networkOperators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          {operator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {previewNetworkOperator && (
                <>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {currentProduct.name}
                    </h3>
                    <Badge variant="outline" className="mt-2">
                      {currentProduct.type}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground">
                    {currentProduct.description}
                  </p>

                  <div className="bg-muted p-4 rounded-md space-y-3">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-medium">
                        ${currentProduct.price.toFixed(2)}
                      </span>
                    </div>

                    {(() => {
                      const selectedOperator =
                        currentProduct.networkOperators.find(
                          (op) => op.id === previewNetworkOperator,
                        );
                      return selectedOperator ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>Network Fee ({selectedOperator.name}):</span>
                          </div>
                          <span>${selectedOperator.fee.toFixed(2)}</span>
                        </div>
                      ) : null;
                    })()}

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total Price:</span>
                      <span>
                        $
                        {(() => {
                          const selectedOperator =
                            currentProduct.networkOperators.find(
                              (op) => op.id === previewNetworkOperator,
                            );
                          return (
                            currentProduct.price + (selectedOperator?.fee || 0)
                          ).toFixed(2);
                        })()}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground text-right">
                      {currentProduct.isMonthly
                        ? "Billed monthly"
                        : "One-time payment"}
                    </div>
                  </div>

                  {currentProduct.maxQuantity && (
                    <div className="text-sm text-muted-foreground">
                      Maximum quantity: {currentProduct.maxQuantity}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    💡 <strong>Note:</strong> Subscribers only see pricing for
                    their specific network operator. This preview shows how the
                    product appears to subscribers in the selected network
                    location.
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ServiceProviderView;
