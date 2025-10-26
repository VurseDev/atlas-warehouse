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
import { Plus, Upload, Package, X, Search } from "lucide-react";

export default function MainPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    supplier: "",
    code: "",
  });
   

  const [errors, setErrors] = React.useState<any>({});
  const [submitted, setSubmitted] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = React.useState<any[]>([]);

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
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    }
  };

  fetchProducts();
  fetchSuppliers();
}, []);


  // Handle image file selection and preview  

const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 // Handle form submission
  const router = useRouter()
  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.supplier || !formData.code) {
      setErrors({ api: "Preencha todos os campos obrigatórios." });
      return;
    }

    const data = {
    p_name: formData.name, // was name
    description: formData.description,
    code: formData.code,
    p_type: formData.supplier, // using supplier as type
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

      // Reset fields
      setFormData({
        name: "",
        description: "",
        supplier: "",
        code: "",
      });
      setImagePreview(null);
      setErrors({});
      onOpenChange(); // close modal

    } catch (err) {
      console.error(err);
      setErrors({ api: "Erro de conexão com o servidor" });
    }
  };

  if (!mounted) return null;

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
                  <Input
                    placeholder="Buscar produtos nos produtos..."
                    startContent={<Search size={20} />}
                    size="lg"
                    classNames={{ base: "max-w-md" }}
                  />
                </div>
        <h2 className="text-3xl font-bold mb-4">Produtos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length > 0 ? (
            products.map((p) => (
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
                <p className="text-default-500">Nenhum produto cadastrado</p>
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
                      <SelectItem key={supplier.value} value={supplier.value}>
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
                    <label className="text-sm font-medium text-foreground">
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
