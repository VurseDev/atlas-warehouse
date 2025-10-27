
/**
 * MainPage component for managing products and inventory.
 * 
 * This component fetches products and suppliers from the API, allows users to add new products,
 * and provides functionality to import and export product data in CSV format.
 * 
 * @component
 * @returns {JSX.Element} The rendered MainPage component.
 * 
 * @hooks
 * - useRouter: For navigation between pages.
 * - useDisclosure: For managing the modal state.
 * - useState: For managing local state including image preview, form data, errors, and product lists.
 * - useEffect: For fetching products and suppliers on component mount.
 * 
 * @state
 * - imagePreview: The preview of the uploaded image.
 * - mounted: Indicates if the component has mounted.
 * - searchQuery: The current search query for filtering products.
 * - formData: The data for the product registration form.
 * - errors: Any validation or API errors.
 * - submitted: The submitted product data.
 * - products: The list of products fetched from the API.
 * - suppliers: The list of suppliers fetched from the API.
 * 
 * @functions
 * - handleImageChange: Handles image file selection and sets the image preview.
 * - removeImage: Resets the image preview and file input.
 * - handleSubmit: Validates and submits the product registration form.
 * - handleExportCSV: Exports the current products list to a CSV file.
 * - handleImportCSV: Imports products from a selected CSV file and registers them.
 * 
 * @render
 * - Navbar: Contains navigation links and a button to add a new product.
 * - Search Bar: Allows users to search for products.
 * - Products Grid: Displays the list of products with options to import/export CSV.
 * - Registration Modal: A modal for registering a new product with form fields.
 */

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image,
  useDisclosure,
} from "@heroui/react";
import { Plus, Upload, Package, X, Search, Download as DownloadIcon, FileText } from "lucide-react";
import Papa from "papaparse";

export default function MainPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [imagePreview, setImagePreview] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    supplier: "",
    code: "",
  });

  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const csvInputRef = React.useRef(null);
  const [products, setProducts] = React.useState([]);
  const [suppliers, setSuppliers] = React.useState([]);

  React.useEffect(() => {
    setMounted(true);

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/regprods");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/regforn");
        const data = await res.json();

            // Map the API response to the format the Select expects
    const formattedSuppliers = data.map((supplier: any) => ({
      value: supplier.s_id.toString(), // or supplier.s_name
      label: supplier.s_name
    }));
    
      console.log("Formatted suppliers:", formattedSuppliers);
    setSuppliers(formattedSuppliers);
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    };

    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleImageChange = (e: React.FormEvent<HTMLFormElement>) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.supplier || !formData.code) {
      setErrors({ api: "Preencha todos os campos obrigatórios." });
      return;
    }

    const data = {
      p_name: formData.name,
      description: formData.description,
      code: formData.code,
      p_type: formData.supplier,
      quantity: 0,
      image: imagePreview,
    };

    try {
      const res = await fetch("/api/regprods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrors({
          api: result.error || `Erro ao registrar produto (${res.status})`,
        });
        return;
      }

      setProducts((prev) => [result, ...prev]);
      setSubmitted(result);
      console.log("✅ Produto registrado:", result);

      setFormData({
        name: "",
        description: "",
        supplier: "",
        code: "",
      });
      setImagePreview(null);
      setErrors({});
      onOpenChange();
    } catch (err) {
      console.error(err);
      setErrors({ api: "Erro de conexão com o servidor" });
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const csvData = products.map(p => ({
      Nome: p.p_name,
      Descrição: p.description,
      Código: p.code,
      Tipo: p.p_type,
      Quantidade: p.quantity
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importedProducts = results.data.map((row) => ({
            p_name: row.Nome || row.name || '',
            description: row.Descrição || row.description || '',
            code: row.Código || row.code || '',
            p_type: row.Tipo || row.type || '',
            quantity: parseInt(row.Quantidade || row.quantity || '0'),
            image: null
          }));

          for (const product of importedProducts) {
            if (product.p_name && product.code) {
              const res = await fetch("/api/regprods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
              });

              if (res.ok) {
                const result = await res.json();
                setProducts((prev) => [...prev, result]);
              }
            }
          }

          alert(`${importedProducts.length} produtos importados com sucesso!`);
        } catch (err) {
          console.error("Erro ao importar CSV:", err);
          alert("Erro ao importar CSV");
        }
      },
      error: (error) => {
        console.error("Erro ao ler CSV:", error);
        alert("Erro ao ler arquivo CSV");
      }
    });

    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  if (!mounted) return null;

  const filteredProducts = products.filter((p) =>
    p.p_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-divider bg-content1/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Image
                  src="./logo.png"
                  alt="Company Logo"
                  width={50}
                  height={35}
                  isBlurred
                />
                <h1 className="text-xl font-bold text-foreground">Atlas</h1>
              </div>
              <div className="hidden lg:flex gap-1">
                <Button variant="light" onPress={() => router.push("/main/index")}>Produtos</Button>
                <Button variant="light" onPress={() => router.push("/main/estoque")}>Estoque</Button>
                <Button variant="light">Relatórios</Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button color="primary" startContent={<Plus size={18} />} onPress={onOpen} className="hidden sm:flex">
                Novo Produto
              </Button>
              <Button color="primary" isIconOnly onPress={onOpen} className="sm:hidden">
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Produtos</h2>
          <p className="text-default-500">Gerencie seus produtos e estoque</p>
        </div>

        {/* Search Bar and CSV Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            placeholder="Buscar produtos..."
            startContent={<Search size={20} />}
            size="lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              base: "max-w-md",
            }}
          />
          
          <div className="flex gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              id="csv-upload"
            />
            <Button
              as="label"
              htmlFor="csv-upload"
              variant="bordered"
              startContent={<Upload size={18} />}
              className="cursor-pointer"
            >
              Importar CSV
            </Button>
            <Button
              variant="bordered"
              startContent={<DownloadIcon size={18} />}
              onPress={handleExportCSV}
              isDisabled={products.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <Card key={p.code}>
                <CardBody className="flex flex-col items-center text-center gap-2">
                  <Image
                    src={p.image || "/placeholder.png"}
                    alt={p.p_name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                  <h3 className="font-semibold">{p.p_name}</h3>
                  <p className="text-sm text-default-500">{p.description}</p>
                  <span className="text-xs text-default-400">Código: {p.code}</span>
                </CardBody>
              </Card>
            ))
          ) : (
            <Card className="border-2 border-dashed border-default-300">
              <CardBody className="flex flex-col items-center justify-center h-48">
                <Package size={48} className="text-default-400 mb-2" />
                <p className="text-default-500">
                  {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="mt-2"
                    onPress={onOpen}
                  >
                    Adicionar Produto
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </main>

      {/* Registration Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Registrar Novo Produto</h3>
                <p className="text-sm text-default-500 font-normal">
                  Preencha as informações do produto
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {errors.api && (
                    <p className="text-danger text-sm bg-danger-50 p-2 rounded-md">
                      {errors.api}
                    </p>
                  )}

                  <Input
                    isRequired
                    label="Nome do Produto"
                    labelPlacement="outside"
                    name="name"
                    placeholder="Digite o nome do produto"
                    variant="bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <Textarea
                    isRequired
                    label="Descrição"
                    labelPlacement="outside"
                    name="description"
                    placeholder="Descreva o produto"
                    variant="bordered"
                    minRows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <Select
                    isRequired
                    label="Fornecedor"
                    labelPlacement="outside"
                    name="supplier"
                    placeholder="Selecione um fornecedor"
                    variant="bordered"
                    selectedKeys={[formData.supplier]}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  >
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.value} value={supplier.value} textValue={supplier.label}>
                        {supplier.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    isRequired
                    label="Código do Produto"
                    labelPlacement="outside"
                    name="code"
                    placeholder="Digite o código manualmente"
                    variant="bordered"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />

                  <div className="flex flex-col gap-2">
                    <label htmlFor="image-upload" className="text-sm font-medium text-foreground">
                        Imagem do Produto
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        variant="bordered"
                        startContent={<Upload size={20} />}
                        className="cursor-pointer"
                      >
                        Carregar Imagem
                      </Button>
                    ) : (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="solid"
                          className="absolute top-2 right-2"
                          onPress={removeImage}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Registrar Produto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}