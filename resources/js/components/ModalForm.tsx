// components/ModalForm.tsx
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ModalFormProps {
  title: string;
  placeholder: string;
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}

export default function ModalForm({
  title,
  placeholder,
  open,
  onClose,
  onSave,
}: ModalFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSave(value.trim());
    setValue("");
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded p-6 w-96 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">{title}</Dialog.Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
