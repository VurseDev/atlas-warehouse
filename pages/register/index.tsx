import React from "react";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Button,
  Image,
} from "@heroui/react";

export default function App() {
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  // Real-time password validation
  const getPasswordError = (value) => {
    if (value.length < 4) {
      return "Senha precisa ter 4 caracteres ou mais";
    }
    if ((value.match(/[A-Z]/g) || []).length < 1) {
      return "Senha precisa de pelo menos uma letra em caixa alta";
    }
    if ((value.match(/[^a-z]/gi) || []).length < 1) {
      return "Senha necessita pelo menos um simbolo";
    }

    return null;
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));

  // Custom validation checks
  const newErrors = {};

  // Password validation
  const passwordError = getPasswordError(data.password);
  if (passwordError) newErrors.password = passwordError;

  if (data.name === "admin") newErrors.name = "ta facil";
  if (data.terms !== "true") newErrors.terms = "Por favor aceite os termos.";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setErrors({ api: result.error || "Erro ao registrar" });
      return;
    }

    setSubmitted(result);
  } catch (err) {
    console.error(err);
    setErrors({ api: "Erro de conexão com o servidor" });
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Form
        className="w-full justify-center items-center space-y-4"
        validationErrors={errors}
        onReset={() => setSubmitted(null)}
        onSubmit={onSubmit}
      >
         <div className="flex flex-col gap-4 max-w-md">
                {/* Logo and Brand Name Section */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src="./logo.png"
                      alt="Company Logo"
                      width={130}
                      height={80}
                      isBlurred
                    />
                    <h1 className="text-5xl font-bold text-foreground">
                      Atlas
                    </h1>
                  </div>
                </div>
        
          
          <Input
            isRequired
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Por favor digite seu nome";
              }

              return errors.name;
            }}
            label="Nome"
            labelPlacement="outside"
            name="name"
            placeholder="Digite seu nome"
          />

          <Input
            isRequired
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Por favor digite seu email";
              }
              if (validationDetails.typeMismatch) {
                return "Por favor digite um email válido";
              }
            }}
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Digite seu Email"
            type="email"
          />

          <Input
            isRequired
            errorMessage={getPasswordError(password)}
            isInvalid={getPasswordError(password) !== null}
            label="Senha"
            labelPlacement="outside"
            name="password"
            placeholder="Digite sua Senha"
            type="password"
            value={password}
            onValueChange={setPassword}
          />

          <Select
            isRequired
            label="País"
            labelPlacement="outside"
            name="country"
            placeholder="Escolha seu país"
          >
            <SelectItem key="br">Brasil</SelectItem>
            <SelectItem key="ar">Argentina</SelectItem>
            <SelectItem key="us">United States</SelectItem>
            <SelectItem key="ca">Canada</SelectItem>
            <SelectItem key="uk">United Kingdom</SelectItem>
            <SelectItem key="au">Australia</SelectItem>
          </Select>

          <Checkbox
            isRequired
            classNames={{
              label: "text-small",
            }}
            isInvalid={!!errors.terms}
            name="terms"
            validationBehavior="aria"
            value="true"
            onValueChange={() =>
              setErrors((prev) => ({ ...prev, terms: undefined }))
            }
          >
            Eu concordo com os termos e condições
          </Checkbox>

          {errors.terms && (
            <span className="text-danger text-small">{errors.terms}</span>
          )}

          <div className="flex gap-4">
            <Button className="w-full" color="primary" type="submit">
              Registrar-se
            </Button>
          </div>
        </div>

        {submitted && (
          <div className="text-small text-default-500 mt-4">
            Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
          </div>
        )}
      </Form>
    </div>
  );
}
