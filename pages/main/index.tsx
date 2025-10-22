"use client";

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
  const [imagePreview, setImagePreview] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const suppliers = [
    { value: "supplier1", label: "Fornecedor A" },
    { value: "supplier2", label: "Fornecedor B" },
    { value: "supplier3", label: "Fornecedor C" },
    { value: "supplier4", label: "Fornecedor D" },
  ];

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

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    // Your API call here
    // const formData = new FormData();
    // formData.append("name", name);
    // formData.append("description", description);
    // etc...
    
    console.log("Product submitted");
    onOpenChange();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-divider bg-content1/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
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
              
              {/* Navigation Links - Desktop */}
              <div className="hidden lg:flex gap-1">
                {/* Map your siteConfig.navItems here */}
                <Button variant="light" className="text-default-600 hover:text-foreground">
                  Dashboard
                </Button>
                <Button variant="light" className="text-default-600 hover:text-foreground">
                  Produtos
                </Button>
                <Button variant="light" className="text-default-600 hover:text-foreground">
                  Estoque
                </Button>
                <Button variant="light" className="text-default-600 hover:text-foreground">
                  Relatórios
                </Button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Button 
                color="primary" 
                startContent={<Plus size={18} />} 
                onPress={onOpen}
                className="hidden sm:flex"
              >
                Novo Produto
              </Button>
              <Button 
                color="primary" 
                isIconOnly
                onPress={onOpen}
                className="sm:hidden"
              >
                <Plus size={20} />
              </Button>
              
              {/* User Menu Button - Placeholder */}
              <Button
                isIconOnly
                variant="light"
                className="text-default-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Produtos</h2>
          <p className="text-default-500">Gerencie seus produtos e estoque</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Buscar produtos..."
            startContent={<Search size={20} />}
            size="lg"
            classNames={{
              base: "max-w-md",
            }}
          />
        </div>

        {/* Products Grid - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Card className="border-2 border-dashed border-default-300">
            <CardBody className="flex items-center justify-center h-48">
              <div className="text-center">
                <Package size={48} className="mx-auto mb-2 text-default-400" />
                <p className="text-default-500">Nenhum produto cadastrado</p>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="mt-2"
                  onPress={onOpen}
                >
                  Adicionar Produto
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>

      {/* Registration Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
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
                  {/* Product Name */}
                  <Input
                    isRequired
                    label="Nome do Produto"
                    labelPlacement="outside"
                    name="name"
                    placeholder="Digite o nome do produto"
                    variant="bordered"
                  />

                  {/* Description */}
                  <Textarea
                    isRequired
                    label="Descrição"
                    labelPlacement="outside"
                    name="description"
                    placeholder="Descreva o produto"
                    variant="bordered"
                    minRows={3}
                  />

                  {/* Supplier Dropdown */}
                  <Select
                    isRequired
                    label="Fornecedor"
                    labelPlacement="outside"
                    name="supplier"
                    placeholder="Selecione um fornecedor"
                    variant="bordered"
                  >
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.value} value={supplier.value}>
                        {supplier.label}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Manual Code */}
                  <Input
                    isRequired
                    label="Código do Produto"
                    labelPlacement="outside"
                    name="code"
                    placeholder="Digite o código manualmente"
                    variant="bordered"
                  />

                  {/* Image Upload */}
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